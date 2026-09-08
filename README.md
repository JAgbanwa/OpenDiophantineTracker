# Open Diophantine Tracker

Open Diophantine Tracker is a public, dependency-free static website for monitoring progress on the open problems in
Bogdan Grechuk's paper `arXiv:2404.08518`, "A systematic approach to Diophantine equations: open problems."

Live site: <https://jagbanwa.github.io/OpenDiophantineTracker/>

## What It Tracks

- Current open entries from the paper's v9 tables and narrative sections.
- Solved or removed entries from the paper's version-change log.
- Problem families such as polynomial parametrization, finiteness, integer-solution existence, homogeneous cases, and Fermat-type primitive-solution lists.
- Local curator notes and status overrides stored in the browser.

## Features

- Search by equation, source table, tag, note, or problem family.
- Filter by status, problem, source, and tag.
- Browse random open or solved entries.
- MathJax rendering for equations.
- A compact catalogue-style header with paper citation.
- Progress map by problem family.
- Progress-map legend:
  - Blue: open entries.
  - Green: solved or removed entries.
  - Amber: partial progress.
  - Teal: watching.
  - Pale track: all tracked entries in that problem family.
- Annotated card view for reading entries one at a time.
- Mathematical index view with status, metric, equation, problem, source, and notes columns.
- Detail panel with citation-style provenance, metric, notes, tags, and evidence links.
- Curator mode for adding local evidence before it belongs in the canonical seed data.
- JSON export/import for local overrides and review entries.
- Visible arXiv synchronization version and last-check date.

## Data Provenance

Seed data and the generated synchronization ledger reflect `arXiv:2404.08518v9`, last revised 30 Aug 2026.

Primary source:

- <https://arxiv.org/abs/2404.08518>
- <https://arxiv.org/pdf/2404.08518>

This site is not an official version of the paper. It is a monitoring interface built from the paper's public data and
change log.

## Automatic Paper Updates

The repository checks arXiv every 12 hours with the GitHub Actions workflow in
`.github/workflows/sync-arxiv.yml`. A manual run is also available from the repository's **Actions** tab.

When arXiv publishes a new version, `scripts/sync_arxiv.py`:

1. Downloads the versioned TeX source from arXiv.
2. Reads every unseen "Changes between versions" subsection.
3. Matches tracked equations mentioned there against the new paper body.
4. Moves an entry to the solved archive only when it is present in the change log and absent from the current open body.
5. Updates `data/paper-sync.js`, commits it with the GitHub Actions bot, and lets GitHub Pages republish the site.

The parser checks source structure, catalogue coverage, and the size of each proposed status change. It fails without
committing if those checks indicate that the paper format has changed. A monthly successful-check commit keeps the
schedule active on an otherwise quiet public repository and exposes the latest check date on the site.

Run the same checks locally with:

```bash
python3 -m unittest discover -s tests -v
python3 scripts/sync_arxiv.py --dry-run
```

## Local Use

Open `index.html` directly in a browser. No site build step is required.

The public site loads MathJax from jsDelivr to render equations. Without network access, the tracker still works, but
equations may appear in TeX source form.

Local edits are stored in browser `localStorage`. Use the Curator section to export or import that state as JSON.

## Deployment

The site is served by GitHub Pages from the `main` branch root:

<https://jagbanwa.github.io/OpenDiophantineTracker/>
