# Who Leaves Clinical Trials?

Visualizing Participant Attrition in Randomized Depression Studies · STATS401 · Alicia Lu and Vera Piao.

We examine variation in registry-reported non-completion, within-trial arm differences and original reasons for leaving. The intended audience is clinical researchers, biostatistics students and readers evaluating retention/reporting. The original [proposal](proposal.md) is preserved.

## Coordinated visual analysis (September 28)

The **[five-view/index.html](five-view/index.html)** now implements the frozen five-view architecture: **Attrition Map, Parallel-Coordinates Trial Explorer, Selected-Trial Participant Flow Sankey, Paired-Arm Dumbbell Comparison, and Reporting / Evidence Matrix**. The map is the hero, a wide brushed explorer connects trial characteristics, and selected-trial count flow sits beside the map. The lower comparison and matrix have bounded scrolling. Methods and original records remain on demand.

**The five-view edition has its own [Pages URL](https://alicialuguyun.github.io/STATS401---Clinical-Trial-Attrition/five-view/).** The previous `/final/` page and root interim page are preserved unchanged. The preceding published map edition is preserved in commit `b4e31963505d3073e49adb88a0f1254c2f1bfe9f`; the earlier [editorial](editorial-2026-09-28/) and [research](research-2026-09-27/) backups also remain intact. The existing [GitHub Pages URL](https://alicialuguyun.github.io/STATS401---Clinical-Trial-Attrition/final/) still serves that preceding published edition. See [the accepted feasibility audit](COMPLEX_VIS_FEASIBILITY_AUDIT.md) and [progress history](FINAL_PROJECT_PROGRESS.md).

From this repository root, using the existing environment:

```sh
.venv/bin/python scripts/deepen.py
.venv/bin/python scripts/validate.py
.venv/bin/python scripts/validate_deep.py
.venv/bin/python scripts/validate_story.py
cp final/data.json final/eligibility.json five-view/
python3 -m http.server 8000
```

Open **http://localhost:8000/five-view/**. Drag across numeric axes or use the keyboard-accessible exact-range form; simultaneous brushes intersect with phase/sponsor filters. Search, click or keyboard-select a trial to update all applicable views. Selection persists independently of subset membership. The Sankey uses that one paired trial's counts; missing pairs and the one missing year are never zero-filled. Gap mode switches between absolute and signed pp; the map always retains its absolute-gap x-axis.

D3 7.9.0 is bundled locally. No npm build, new dependency or CDN is required. `five-view/dashboard-data.js` contains pure display transformations and subset predicates, not new analysis. Existing CSVs and `final/data.json` remain byte-identical. The explicit copy above synchronizes only the two validated data payloads into the new route; it does not change either page implementation. `scripts/build_page.py` still rebuilds only the original root interim page.

Analysis/rebuild needs the original local raw snapshot plus the committed interim tables. A clone without raw data can still serve the derived `final/data.json` but cannot reproduce the exact historical raw-to-table audit by downloading today's registry records.

Run `node scripts/validate_dashboard.cjs` for count-conservation and subset mathematics (Node only). Browser verification: with Playwright available to Node and Google Chrome installed, run `node scripts/check_dashboard.cjs` while the local server is running. `SITE_URL` may override the local URL. It checks real interactions and saves screenshots/results under `/private/tmp/` on this macOS workspace. Browser tooling is optional and separate from the Python/site dependencies.

## Interim page

**Submission link: [Final Project GitHub Page](https://alicialuguyun.github.io/STATS401---Clinical-Trial-Attrition/).**

The page and all three figures were verified in Chrome. [Interim audit](docs/INTERIM_AUDIT.md) records the checks. The static source is [index.html](index.html).

## Data and methods

ClinicalTrials.gov API snapshot, September 13, 2026: 335 candidates → 201 conservatively eligible trials → 82 usable single-period trials / 221 arms. Processed tables contain 201 trial rows, 403 single-period arm rows and 1,896 original reason rows (including flagged records). The landscape uses 80 trials with completion years; comparisons use 38 unambiguously paired two-arm trials; the reason plot uses 152 reconciled arms from 55 trials.

Attrition is `1 - COMPLETED/STARTED` in the sole reported period; STARTED, not enrollment, is the denominator. The period may include follow-up. Multi-period and unresolved arm mappings are deferred, not guessed. See [data dictionary](docs/DATA_DICTIONARY.md), [design/evaluation plan](docs/VISUALIZATION_DESIGN.md) and [validation](data/processed/validation.json).

## Setup

Tested with Python 3.9.6 and Matplotlib 3.9.4 on macOS arm64. Python standard library handles acquisition/processing; curl is required for acquisition. Isolated plotting dependencies are pinned in requirements.txt.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

## Reproduce figures from committed tables (no download needed)

Run from this repository root:

```sh
.venv/bin/python scripts/figures.py
python3 scripts/build_page.py
python3 -m http.server 8000
```

Open http://localhost:8000 . All site assets are relative; no JavaScript framework or build service is required. Figures are saved in both SVG and PNG. `plot_*.csv` and findings.json record exact plotting inputs/results.

## Acquire and process source data

The existing raw snapshot lives locally at `data/raw/2026-09-13/` with four `page_*.json` files and `manifest.json`. Do not reacquire it if present and hash-valid. Raw records are unmodified and ignored by Git (~24 MB); small aggregate CSVs are public. Query and URLs are in `data/processed/source_manifest.json`.

For a fresh clone without raw data:

```sh
python3 scripts/acquire.py --output data/raw/2026-09-13
python3 scripts/process.py --raw data/raw/2026-09-13
.venv/bin/python scripts/figures.py
python3 scripts/build_page.py
.venv/bin/python scripts/validate.py
```

A new API request retrieves the records **as they exist now**, not necessarily the original snapshot. Prefer a new date-named directory for later snapshots and pass it with `--raw`; validation currently targets the interim snapshot path. Preserve the original raw archive for exact raw-to-table reproduction. To verify the frozen interim, run validation against that original local snapshot; it verifies SHA-256 and all raw count links, then reproduces tables/figures. No seed is needed: processing and plotting are deterministic.

## Structure

- `proposal.md`: unchanged original proposal.
- `scripts/`: acquisition, processing, plotting, static page rendering and numerical validation.
- `data/raw/`: local immutable archive (ignored, apart from README).
- `data/processed/`: small aggregate CSVs, QC, source manifest and exact figure inputs.
- `figures/`: three static figures, SVG and PNG.
- `index.html`, `style.css`, `.nojekyll`: GitHub Pages-compatible site.
- `docs/`: data dictionary, design/evaluation, interim audit and preserved assignment text.
- `PROJECT_LOG.md`: append-only history, including copied earlier recovery session.
- `PROJECT_PLAN.md`, `PROJECT_PROPOSAL_SUMMARY.md`, `STATS401_REQUIREMENTS.md`: preserved recovery documents plus current updates.

## Limits and next steps

Not a census of all depression trials. Strict automated mappings and the single-period rule restrict coverage; condition labels, follow-up and interventions vary. One source record reports zero completions and is explicitly flagged. Reasons remain unharmonized; missing tables are never zero-filled. No causal inference, individual prediction or formal usability results are claimed. Review flagged records, add D3 interactions and conduct the planned evaluation next. Final Sankey, five interactive views, poster and report are later work.

The page narrative is reviewed for the frozen interim snapshot. build_page.py intentionally refuses changed key counts; after a new acquisition, review and update the narrative and snapshot-specific documentation before publishing.
