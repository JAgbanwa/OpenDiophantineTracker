# Open Diophantine Tracker

Open Diophantine Tracker is a public, dependency-free static website for monitoring progress on the open problems in
Bogdan Grechuk's paper `arXiv:2404.08518`, "A systematic approach to Diophantine equations: open problems."

Live site: <https://jagbanwa.github.io/OpenDiophantineTracker/>

## What It Tracks

- Current open entries from the paper's v8 tables and narrative sections.
- Solved or removed entries from the paper's version-change log.
- Problem families such as polynomial parametrization, finiteness, integer-solution existence, homogeneous cases, and Fermat-type primitive-solution lists.
- Local curator notes and status overrides stored in the browser.

## Features

- Search by equation, source table, tag, note, or problem family.
- Filter by status, problem, source, and tag.
- Browse random open or solved entries.
- Progress map by problem family.
- Progress-map legend:
  - Blue: open entries.
  - Green: solved or removed entries.
  - Amber: partial progress.
  - Teal: watching.
  - Pale track: total capacity for that problem family.
- Detail panel with paper source, metric, notes, tags, and evidence links.
- Curator mode for adding local evidence before it belongs in the canonical seed data.
- JSON export/import for local overrides and review entries.

## Data Provenance

Seed data reflects `arXiv:2404.08518v8`, last revised 13 Jul 2026.

Primary source:

- <https://arxiv.org/abs/2404.08518>
- <https://arxiv.org/pdf/2404.08518>

This site is not an official version of the paper. It is a monitoring interface built from the paper's public data and
change log.

## Local Use

Open `index.html` directly in a browser. No build step is required.

Local edits are stored in browser `localStorage`. Use the Curator section to export or import that state as JSON.

## Deployment

The site is served by GitHub Pages from the `main` branch root:

<https://jagbanwa.github.io/OpenDiophantineTracker/>
