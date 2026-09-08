#!/usr/bin/env python3
"""Synchronize solved tracker entries with a new arXiv paper version."""

from __future__ import annotations

import argparse
import datetime as dt
import html
import io
import json
import re
import subprocess
import sys
import tarfile
import time
import urllib.error
import urllib.request
from pathlib import Path


ARXIV_ID = "2404.08518"
USER_AGENT = (
    "OpenDiophantineTracker/1.0 "
    "(+https://github.com/JAgbanwa/OpenDiophantineTracker)"
)
SYNC_PREFIX = "window.PAPER_SYNC = "
CHECKPOINT_DAYS = 30
MIN_BODY_COVERAGE = 0.60
MAX_RESOLUTION_SHARE = 0.30


class SyncError(RuntimeError):
    """Raised when a paper update cannot be classified safely."""


def repository_root() -> Path:
    return Path(__file__).resolve().parents[1]


def strip_html(source: str) -> str:
    source = re.sub(r"<script\b.*?</script>", " ", source, flags=re.I | re.S)
    source = re.sub(r"<style\b.*?</style>", " ", source, flags=re.I | re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", source))).strip()


def fetch_bytes(url: str, attempts: int = 3) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                return response.read()
        except (urllib.error.URLError, TimeoutError) as error:
            last_error = error
            if "CERTIFICATE_VERIFY_FAILED" in str(error):
                break
            if attempt + 1 < attempts:
                time.sleep(2**attempt)

    try:
        fallback = subprocess.run(
            [
                "curl",
                "-fsSL",
                "--retry",
                str(attempts),
                "--max-time",
                "45",
                "-A",
                USER_AGENT,
                url,
            ],
            check=True,
            capture_output=True,
        )
        return fallback.stdout
    except (FileNotFoundError, subprocess.CalledProcessError) as curl_error:
        raise SyncError(
            f"Unable to fetch {url} with urllib ({last_error}) or curl ({curl_error})"
        ) from curl_error


def parse_arxiv_metadata(abs_html: str) -> dict:
    text = strip_html(abs_html)
    version_matches = re.findall(r"\bv(\d+)\b", text)
    if not version_matches:
        raise SyncError("Could not determine the latest arXiv version")

    latest_number = max(int(value) for value in version_matches)
    latest_version = f"v{latest_number}"
    history_pattern = re.compile(
        r"\[?v(\d+)\]?\s+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+"
        r"(\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4})"
    )
    history = {f"v{number}": date for number, date in history_pattern.findall(text)}

    if latest_version not in history:
        revised = re.search(
            rf"last revised\s+(\d{{1,2}}\s+[A-Z][a-z]{{2}}\s+\d{{4}}).*?{latest_version}",
            text,
            flags=re.I,
        )
        if revised:
            history[latest_version] = revised.group(1)

    if latest_version not in history:
        raise SyncError(f"Could not determine the revision date for {latest_version}")

    return {
        "version": latest_version,
        "versionNumber": latest_number,
        "revisionDate": history[latest_version],
        "history": history,
    }


def extract_tex_source(archive: bytes) -> str:
    try:
        with tarfile.open(fileobj=io.BytesIO(archive), mode="r:*") as bundle:
            candidates = [
                member for member in bundle.getmembers()
                if member.isfile() and member.name.lower().endswith(".tex")
            ]
            if not candidates:
                raise SyncError("The arXiv source archive contains no TeX file")
            preferred = next(
                (member for member in candidates if Path(member.name).name == "open.tex"),
                max(candidates, key=lambda member: member.size),
            )
            extracted = bundle.extractfile(preferred)
            if extracted is None:
                raise SyncError(f"Unable to read {preferred.name} from the source archive")
            return extracted.read().decode("utf-8")
    except tarfile.TarError as error:
        raise SyncError(f"The arXiv source is not a readable archive: {error}") from error


def strip_tex_comments(source: str) -> str:
    lines = []
    for line in source.splitlines():
        comment_at = None
        for index, character in enumerate(line):
            if character != "%":
                continue
            backslashes = 0
            cursor = index - 1
            while cursor >= 0 and line[cursor] == "\\":
                backslashes += 1
                cursor -= 1
            if backslashes % 2 == 0:
                comment_at = index
                break
        lines.append(line if comment_at is None else line[:comment_at])
    return "\n".join(lines)


def unwrap_command(value: str, command_pattern: str) -> str:
    match = re.fullmatch(command_pattern + r"\{(.*)\}", value, flags=re.S)
    return match.group(1) if match else value


def normalize_equation(value: str) -> str:
    value = value.strip().strip("$ ")
    previous = None
    while value != previous:
        previous = value
        value = unwrap_command(value, r"\\(?:rev|boxed)")
        value = unwrap_command(value, r"\\textcolor\{[^{}]+\}")

    replacements = {
        "−": "-",
        "\\pm": "+/-",
        "\\mp": "-/+",
        "\\neq": "!=",
        "\\ne": "!=",
        "\\geqslant": ">=",
        "\\geq": ">=",
        "\\ge": ">=",
        "\\leqslant": "<=",
        "\\leq": "<=",
        "\\le": "<=",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)

    value = re.sub(r"\\(?:displaystyle|textstyle|scriptstyle)\b", "", value)
    value = re.sub(r"\\(?:left|right|bigl|bigr|Bigl|Bigr)\b", "", value)
    value = re.sub(r"\\(?:qquad|quad|[,;!])", "", value)
    value = re.sub(r"\^\{([^{}]+)\}", r"^\1", value)
    value = re.sub(r"_\{([^{}]+)\}", r"_\1", value)
    value = value.replace("{", "").replace("}", "")
    value = re.sub(r"\s+", "", value)
    return value.rstrip(".,;")


MATH_PATTERN = re.compile(
    r"\$\$(.*?)\$\$"
    r"|\\\[(.*?)\\\]"
    r"|\\begin\{(?:equation\*?|align\*?|aligned)\}(.*?)\\end\{(?:equation\*?|align\*?|aligned)\}"
    r"|(?<!\$)\$(?!\$)(.*?)(?<!\\)\$(?!\$)",
    flags=re.S,
)


def extract_math(source: str) -> list[str]:
    chunks = []
    for match in MATH_PATTERN.finditer(source):
        chunk = next((group for group in match.groups() if group is not None), "")
        chunk = re.sub(r"\\label\{[^{}]+\}", "", chunk)
        normalized = normalize_equation(chunk)
        if normalized:
            chunks.append(normalized)
    return chunks


def changes_start(source: str) -> int:
    match = re.search(
        r"\\section\{Changes in this document between versions\}",
        source,
    )
    if not match:
        raise SyncError("The TeX source has no version-change section")
    return match.start()


def extract_change_section(source: str, old_number: int, new_number: int) -> str:
    heading = re.compile(
        rf"\\subsection\{{Changes between versions\s+{old_number}\s+and\s+{new_number}\}}"
    )
    match = heading.search(source)
    if not match:
        raise SyncError(f"No change subsection found for v{old_number} to v{new_number}")
    next_heading = re.search(r"\\(?:subsection|section)\{", source[match.end():])
    end = match.end() + next_heading.start() if next_heading else len(source)
    return source[match.end():end]


def equation_present(target: str, corpus: list[str]) -> bool:
    if len(target) < 5 or "=" not in target:
        return False
    return any(target == candidate or target in candidate for candidate in corpus)


def detect_resolved_entries(
    entries: list[dict],
    tex_source: str,
    old_number: int,
    new_number: int,
) -> tuple[list[dict], dict]:
    uncommented = strip_tex_comments(tex_source)
    main_body = uncommented[:changes_start(uncommented)]
    change_section = extract_change_section(uncommented, old_number, new_number)
    main_math = extract_math(main_body)
    change_math = extract_math(change_section)

    tracked = [entry for entry in entries if normalize_equation(entry.get("equation", ""))]
    still_present = sum(
        equation_present(normalize_equation(entry["equation"]), main_math)
        for entry in tracked
    )
    coverage = still_present / max(len(tracked), 1)
    if coverage < MIN_BODY_COVERAGE:
        raise SyncError(
            f"Only {coverage:.0%} of tracked open entries were found in the new paper body; "
            "the source format may have changed"
        )

    resolved = []
    for entry in tracked:
        equation = normalize_equation(entry["equation"])
        if equation_present(equation, change_math) and not equation_present(equation, main_math):
            resolved.append(entry)

    share = len(resolved) / max(len(tracked), 1)
    if share > MAX_RESOLUTION_SHARE:
        raise SyncError(
            f"The parser classified {share:.0%} of open entries as resolved; refusing a large automatic change"
        )

    report = {
        "trackedOpenEntries": len(tracked),
        "entriesStillPresent": still_present,
        "bodyCoverage": round(coverage, 4),
        "changeMathExpressions": len(change_math),
        "resolvedEntryAppearances": len(resolved),
        "resolvedUniqueEquations": len({normalize_equation(entry["equation"]) for entry in resolved}),
        "changeLogHasResolutionLanguage": bool(
            re.search(r"\b(?:solved|removed|excluded)\b", change_section, flags=re.I)
        ),
    }
    return resolved, report


def load_sync_data(path: Path) -> dict:
    source = path.read_text(encoding="utf-8").strip()
    if not source.startswith(SYNC_PREFIX) or not source.endswith(";"):
        raise SyncError(f"{path} does not have the expected generated wrapper")
    return json.loads(source[len(SYNC_PREFIX):-1])


def write_sync_data(path: Path, data: dict) -> None:
    serialized = json.dumps(data, indent=2, ensure_ascii=True)
    path.write_text(f"{SYNC_PREFIX}{serialized};\n", encoding="utf-8")


def export_catalogue(root: Path) -> dict:
    result = subprocess.run(
        ["node", str(root / "scripts" / "export_catalogue.mjs")],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def effective_open_entries(catalogue: dict) -> list[dict]:
    sync = catalogue["sync"]
    resolved_ids = {entry["id"] for entry in sync.get("resolvedEntries", [])}
    entries = [*catalogue["baseOpen"], *sync.get("openAdditions", [])]
    return [entry for entry in entries if entry["id"] not in resolved_ids]


def version_number(value: str) -> int:
    match = re.fullmatch(r"v(\d+)", value or "")
    if not match:
        raise SyncError(f"Invalid paper version: {value!r}")
    return int(match.group(1))


def checkpoint_due(last_checked: str | None, today: dt.date) -> bool:
    if not last_checked:
        return True
    try:
        checked = dt.date.fromisoformat(last_checked)
    except ValueError:
        return True
    return today - checked >= dt.timedelta(days=CHECKPOINT_DAYS)


def make_resolution(entry: dict, old_number: int, new_number: int, date: str) -> dict:
    version_label = f"v{old_number} to v{new_number}"
    change_url = f"https://arxiv.org/html/{ARXIV_ID}v{new_number}#S8"
    return {
        "id": entry["id"],
        "resolvedIn": version_label,
        "resolvedDate": date,
        "note": (
            f"Automatically matched to the paper's {version_label} change log and no longer "
            "present in the current open catalogue."
        ),
        "links": [change_url],
        "detectedBy": "paper-change-log",
    }


def make_event(
    old_number: int,
    new_number: int,
    date: str,
    resolved: list[dict],
    report: dict,
) -> dict:
    unique_equations = len({normalize_equation(entry["equation"]) for entry in resolved})
    if resolved:
        bullets = [
            f"{len(resolved)} tracked appearance(s), representing {unique_equations} equation(s), moved to the solved archive.",
            "Each match appears in the release change log and is absent from the new paper's open body.",
        ]
    else:
        bullets = [
            "No currently tracked open equation was classified as newly solved in this release.",
            "The paper metadata was updated after the source passed structural validation.",
        ]
    return {
        "version": f"v{old_number} to v{new_number}",
        "date": date,
        "headline": "Automatic arXiv release synchronization.",
        "bullets": bullets,
        "links": [f"https://arxiv.org/html/{ARXIV_ID}v{new_number}#S8"],
        "generated": True,
        "report": report,
    }


def synchronize(
    root: Path,
    metadata: dict,
    tex_source: str | None,
    today: dt.date,
    dry_run: bool = False,
) -> dict:
    sync_path = root / "data" / "paper-sync.js"
    sync = load_sync_data(sync_path)
    catalogue = export_catalogue(root)
    current_number = version_number(sync["paper"]["version"])
    latest_number = metadata["versionNumber"]
    changed = False
    reports = []

    if latest_number < current_number:
        raise SyncError(
            f"arXiv reports v{latest_number}, older than the tracked v{current_number}"
        )

    if latest_number > current_number:
        if tex_source is None:
            raise SyncError("A newer version requires TeX source")
        open_entries = effective_open_entries(catalogue)
        known_resolved = {entry["id"] for entry in sync.get("resolvedEntries", [])}

        for new_number in range(current_number + 1, latest_number + 1):
            old_number = new_number - 1
            resolved, report = detect_resolved_entries(
                open_entries,
                tex_source,
                old_number,
                new_number,
            )
            report["version"] = f"v{old_number} to v{new_number}"
            reports.append(report)
            release_date = metadata["history"].get(
                f"v{new_number}", metadata["revisionDate"]
            )
            new_resolutions = [entry for entry in resolved if entry["id"] not in known_resolved]
            sync.setdefault("resolvedEntries", []).extend(
                make_resolution(entry, old_number, new_number, release_date)
                for entry in new_resolutions
            )
            known_resolved.update(entry["id"] for entry in new_resolutions)
            removed_ids = {entry["id"] for entry in new_resolutions}
            open_entries = [entry for entry in open_entries if entry["id"] not in removed_ids]
            sync.setdefault("events", []).append(
                make_event(old_number, new_number, release_date, new_resolutions, report)
            )

        sync["paper"].update(
            {
                "version": metadata["version"],
                "revisionDate": metadata["revisionDate"],
                "versionUrl": f"https://arxiv.org/abs/{ARXIV_ID}{metadata['version']}",
                "changeUrl": f"https://arxiv.org/html/{ARXIV_ID}{metadata['version']}#S8",
                "syncedAt": today.isoformat(),
                "checkedAt": today.isoformat(),
            }
        )
        sync["lastReport"] = reports[-1] if reports else {}
        changed = True
    elif checkpoint_due(sync["paper"].get("checkedAt"), today):
        sync["paper"]["checkedAt"] = today.isoformat()
        sync["lastReport"] = {
            "version": metadata["version"],
            "result": "No newer arXiv version found",
            "checkedAt": today.isoformat(),
        }
        changed = True

    if changed and not dry_run:
        write_sync_data(sync_path, sync)

    return {
        "changed": changed,
        "dryRun": dry_run,
        "trackedVersion": f"v{current_number}",
        "latestVersion": metadata["version"],
        "reports": reports,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-archive",
        type=Path,
        help="Use a local arXiv source archive instead of downloading it",
    )
    parser.add_argument(
        "--latest-version",
        help="Version paired with --source-archive, for example v9",
    )
    parser.add_argument(
        "--revision-date",
        help="Revision date paired with --source-archive, for example '30 Aug 2026'",
    )
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = repository_root()
    today = dt.datetime.now(dt.timezone.utc).date()

    try:
        if args.source_archive:
            if not args.latest_version or not args.revision_date:
                raise SyncError(
                    "--source-archive requires --latest-version and --revision-date"
                )
            archive = args.source_archive.read_bytes()
            latest_number = version_number(args.latest_version)
            metadata = {
                "version": args.latest_version,
                "versionNumber": latest_number,
                "revisionDate": args.revision_date,
                "history": {args.latest_version: args.revision_date},
            }
        else:
            abs_html = fetch_bytes(f"https://arxiv.org/abs/{ARXIV_ID}").decode("utf-8")
            metadata = parse_arxiv_metadata(abs_html)
            archive = b""
            if metadata["versionNumber"] > version_number(
                load_sync_data(root / "data" / "paper-sync.js")["paper"]["version"]
            ):
                archive = fetch_bytes(
                    f"https://arxiv.org/src/{ARXIV_ID}{metadata['version']}"
                )

        tex_source = extract_tex_source(archive) if archive else None
        result = synchronize(root, metadata, tex_source, today, args.dry_run)
        print(json.dumps(result, indent=2))
        return 0
    except (SyncError, OSError, subprocess.CalledProcessError, json.JSONDecodeError) as error:
        print(f"sync failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
