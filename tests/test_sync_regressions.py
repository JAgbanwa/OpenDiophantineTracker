import copy
import datetime as dt
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.sync_arxiv import (
    SyncError,
    detect_resolved_entries,
    equation_present,
    extract_math,
    load_sync_data,
    normalize_equation,
    resolution_math,
    synchronize,
    write_sync_data,
)


def catalogue_entries(count):
    return [
        {"id": f"entry-{number}", "equation": f"x^2+{number + 1}=0"}
        for number in range(count)
    ]


def release_source(present, changes):
    body = "\n".join(f"${entry['equation']}$" for entry in present)
    return (
        "\\section{Current open catalogue}\n"
        + body
        + "\n\\section{Changes in this document between versions}\n"
        + "\\subsection{Changes between versions 9 and 10}\n"
        + changes
    )


def removal_paragraph(entries):
    equations = ", ".join(f"${entry['equation']}$" for entry in entries)
    return f"The equations {equations} have been solved and removed.\n"


class ClassificationRegressionTests(unittest.TestCase):
    def test_anaphoric_negative_status_cannot_borrow_removal_evidence(self):
        changes = (
            "The equation $x^2+1=0$ was discussed. It has not been removed. "
            "The equation $y^2+1=0$ has been removed."
        )
        self.assertEqual(resolution_math(changes), [])

    def test_labels_and_equivalence_chains_preserve_complete_equations(self):
        source = r"""
\[ (a) \,\, y(x^3-z^2)=z \quad \quad (b) \,\, x^2y^2+x=z^3 \]
$y(x^3-z^2)=z \,\, \Leftrightarrow \,\, x^2y^2+x=z^3 \,\, \Leftrightarrow \,\, x^3y^2=z^3-1$
"""
        equations = extract_math(source)
        for equation in ("y(x^3-z^2)=z", "x^2y^2+x=z^3", "x^3y^2=z^3-1"):
            self.assertTrue(equation_present(normalize_equation(equation), equations))

    def test_documented_bulk_release_can_remove_more_than_forty_percent(self):
        entries = catalogue_entries(10)
        source = release_source(entries[8:], removal_paragraph(entries[:8]))

        resolved, report = detect_resolved_entries(entries, source, 9, 10)

        self.assertEqual([entry["id"] for entry in resolved], [e["id"] for e in entries[:8]])
        self.assertEqual(report["entriesStillPresent"], 2)
        self.assertEqual(report["resolvedEntryAppearances"], 8)
        self.assertEqual(report["accountedCoverage"], 1.0)
        self.assertEqual(report["unexplainedOpenEntries"], 0)

    def test_missing_mention_cannot_borrow_another_paragraphs_removal_evidence(self):
        entries = catalogue_entries(21)
        changes = (
            f"The notation of ${entries[0]['equation']}$ has been discussed.\n\n"
            "The equation $y^2+99=0$ has been solved and removed.\n"
        )
        source = release_source(entries[1:], changes)

        resolved, report = detect_resolved_entries(entries, source, 9, 10)

        self.assertEqual(resolved, [])
        self.assertEqual(report["unexplainedOpenEntries"], 1)
        self.assertEqual(report["unexplainedEntryIds"], [entries[0]["id"]])
        self.assertAlmostEqual(report["accountedCoverage"], 20 / 21, places=4)

    def test_negative_or_unresolved_language_is_not_resolution_evidence(self):
        entries = catalogue_entries(21)
        for statement in (
            "has not been removed",
            "has not been solved",
            "was not removed",
            "remains unresolved",
            "remains unsolved",
        ):
            with self.subTest(statement=statement):
                source = release_source(
                    entries[1:], f"The equation ${entries[0]['equation']}$ {statement}.\n"
                )
                resolved, report = detect_resolved_entries(entries, source, 9, 10)
                self.assertEqual(resolved, [])
                self.assertEqual(report["unexplainedEntryIds"], [entries[0]["id"]])

    def test_unsupported_mass_disappearance_still_fails_closed(self):
        entries = catalogue_entries(10)
        mentions = " and ".join(f"${e['equation']}$" for e in entries[:4])
        source = release_source(entries[4:], f"We discuss {mentions}.\n")

        with self.assertRaises(SyncError):
            detect_resolved_entries(entries, source, 9, 10)

    def test_equation_still_in_body_cannot_be_archived(self):
        entries = catalogue_entries(4)
        source = release_source(entries, removal_paragraph(entries[:1]))

        resolved, report = detect_resolved_entries(entries, source, 9, 10)

        self.assertEqual(resolved, [])
        self.assertEqual(report["entriesStillPresent"], len(entries))

    def test_monomial_factor_order_preserves_equation_identity(self):
        self.assertEqual(
            normalize_equation("2z^2+y^2x+x^3+1=0"),
            normalize_equation("2z^2+xy^2+x^3+1=0"),
        )
        for left, right in (
            ("xy^2=0", "x^2y=0"),
            ("2xy=0", "xy=0"),
            ("-xy=0", "xy=0"),
            ("x^{12}y=0", "x^2y=0"),
            ("x(y+1)=0", "xy+x=0"),
        ):
            with self.subTest(left=left, right=right):
                self.assertNotEqual(normalize_equation(left), normalize_equation(right))

    def test_commuted_monomial_in_change_log_is_classified(self):
        entries = [{"id": "commuted", "equation": "2z^2+y^2x+x^3+1=0"}]
        source = release_source(
            [], "The equation $2z^2+xy^2+x^3+1=0$ has been solved and removed.\n"
        )

        resolved, report = detect_resolved_entries(entries, source, 9, 10)

        self.assertEqual([entry["id"] for entry in resolved], ["commuted"])
        self.assertEqual(report["accountedCoverage"], 1.0)

    def test_equation_matching_rejects_polynomial_prefix_and_suffix_collisions(self):
        target = normalize_equation("x^2=1")
        for other in ("2x^2=1", "x^2=10", "x^2=1+y", "y+x^2=1"):
            with self.subTest(other=other):
                self.assertFalse(equation_present(target, [normalize_equation(other)]))

    def test_equations_in_display_array_are_individually_matchable(self):
        source = r"""
\[
\begin{array}{ll}
x^2+1=0, & y^2+2=0,\\
z^2+3=0, & t^2+4=0.
\end{array}
\]
"""
        expressions = extract_math(source)
        for equation in ("x^2+1=0", "y^2+2=0", "z^2+3=0", "t^2+4=0"):
            with self.subTest(equation=equation):
                self.assertTrue(equation_present(normalize_equation(equation), expressions))
        self.assertFalse(equation_present(normalize_equation("x^2+1=00"), expressions))


class SynchronizationRegressionTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        (self.root / "data").mkdir()
        self.ledger = self.root / "data" / "paper-sync.js"
        self.entries = catalogue_entries(10)
        self.initial = {
            "schemaVersion": 1,
            "paper": {
                "version": "v9",
                "revisionDate": "30 Aug 2026",
                "checkedAt": "2026-09-08",
            },
            "resolvedEntries": [],
            "openAdditions": [],
            "events": [],
        }
        write_sync_data(self.ledger, self.initial)
        self.metadata = {
            "version": "v10",
            "versionNumber": 10,
            "revisionDate": "1 Oct 2026",
            "history": {"v10": "1 Oct 2026"},
        }
        self.today = dt.date(2026, 10, 2)

    def exported_catalogue(self, root):
        return {
            "baseOpen": copy.deepcopy(self.entries),
            "sync": load_sync_data(root / "data" / "paper-sync.js"),
        }

    def test_failed_classification_leaves_ledger_byte_identical(self):
        original = self.ledger.read_bytes()
        source = release_source(self.entries[8:], "Only formatting changes were made.\n")

        with patch("scripts.sync_arxiv.export_catalogue", side_effect=self.exported_catalogue):
            with self.assertRaises(SyncError):
                synchronize(self.root, self.metadata, source, self.today)

        self.assertEqual(self.ledger.read_bytes(), original)

    def test_dry_run_reports_supported_changes_without_writing(self):
        original = self.ledger.read_bytes()
        source = release_source(self.entries[8:], removal_paragraph(self.entries[:8]))

        with patch("scripts.sync_arxiv.export_catalogue", side_effect=self.exported_catalogue):
            result = synchronize(self.root, self.metadata, source, self.today, dry_run=True)

        self.assertTrue(result["changed"])
        self.assertTrue(result["dryRun"])
        self.assertEqual(result["reports"][0]["resolvedEntryAppearances"], 8)
        self.assertEqual(self.ledger.read_bytes(), original)

    def test_successful_bulk_update_is_idempotent(self):
        source = release_source(self.entries[8:], removal_paragraph(self.entries[:8]))

        with patch("scripts.sync_arxiv.export_catalogue", side_effect=self.exported_catalogue):
            first = synchronize(self.root, self.metadata, source, self.today)
            synchronized = self.ledger.read_bytes()
            second = synchronize(self.root, self.metadata, None, self.today)

        self.assertTrue(first["changed"])
        self.assertFalse(second["changed"])
        self.assertEqual(self.ledger.read_bytes(), synchronized)
        ledger = load_sync_data(self.ledger)
        self.assertEqual(ledger["paper"]["version"], "v10")
        self.assertEqual(len(ledger["resolvedEntries"]), 8)
        self.assertEqual(len(ledger["events"]), 1)

    def test_catch_up_accounts_for_later_removals_before_assigning_versions(self):
        source = release_source(self.entries[8:], removal_paragraph(self.entries[:2]))
        source += (
            "\n\\subsection{Changes between versions 10 and 11}\n"
            + removal_paragraph(self.entries[2:8])
        )
        self.metadata.update(version="v11", versionNumber=11, revisionDate="2 Oct 2026")
        self.metadata["history"]["v11"] = "2 Oct 2026"
        with patch("scripts.sync_arxiv.export_catalogue", side_effect=self.exported_catalogue):
            result = synchronize(self.root, self.metadata, source, self.today)

        self.assertEqual([r["resolvedEntryAppearances"] for r in result["reports"]], [2, 6])
        self.assertTrue(all(r["accountedCoverage"] == 1 for r in result["reports"]))
        ledger = load_sync_data(self.ledger)
        self.assertEqual(ledger["paper"]["version"], "v11")
        self.assertEqual([e["resolvedIn"] for e in ledger["resolvedEntries"]],
                         ["v9 to v10"] * 2 + ["v10 to v11"] * 6)

    def test_missing_intermediate_release_leaves_ledger_unchanged(self):
        original = self.ledger.read_bytes()
        source = release_source(self.entries[8:], removal_paragraph(self.entries[:8]))
        self.metadata.update(version="v11", versionNumber=11)
        with patch("scripts.sync_arxiv.export_catalogue", side_effect=self.exported_catalogue):
            with self.assertRaises(SyncError):
                synchronize(self.root, self.metadata, source, self.today)
        self.assertEqual(self.ledger.read_bytes(), original)


if __name__ == "__main__":
    unittest.main()
