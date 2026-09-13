# Local immutable raw snapshots

Current snapshot: `2026-09-13/`, 335 studies in four API page JSON files, ~24 MB. `manifest.json` records query, exact URLs, UTC times and SHA-256 hashes. The snapshot is ignored by Git and must be preserved unchanged locally.

From repository root, create a new snapshot with `python3 scripts/acquire.py --output data/raw/YYYY-MM-DD-new`. Never reuse an existing directory. See the main README for processing commands. Records change over time: reacquisition is not guaranteed to reproduce the exact historical snapshot. The public copy of the source manifest is `data/processed/source_manifest.json`.
