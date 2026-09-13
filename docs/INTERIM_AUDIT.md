# Interim check-in audit

Status: all interim requirements verified on the published GitHub Page, 2026-09-13. Requirement source: user-supplied official interim instructions on 2026-09-13; no deadline inferred, no slides required.

| Interim requirement | Evidence | Status |
|---|---|---|
| Raw dataset described | index.html#dataset; docs/DATA_DICTIONARY.md; source_manifest.json | DONE |
| Processed dataset described | index.html#dataset; five linked CSVs and dictionary | DONE |
| Cleaning explained | index.html#dataset; scripts/process.py; QC flags | DONE |
| Static visualization 1 | figures/01_attrition_landscape.svg + PNG; plot_landscape.csv | DONE |
| Static visualization 2 | figures/02_arm_differences.svg + PNG; plot_pairs.csv | DONE |
| Static visualization 3 | figures/03_reported_reasons.svg + PNG; plot_reasons_all.csv | DONE |
| Interaction plan for visualization 1 | index.html#landscape; design document | DONE |
| Interaction plan for visualization 2 | index.html#differences; design document | DONE |
| Interaction plan for visualization 3 | index.html#reasons; design document | DONE |
| Evaluation: what | index.html#evaluation; design document | DONE |
| Evaluation: how | index.html#evaluation; five tasks, 4–6 classmates planned | DONE |
| Evaluation: data/feedback | index.html#evaluation; accuracy/time/ratings/comments | DONE |
| GitHub Page works | https://alicialuguyun.github.io/STATS401---Clinical-Trial-Attrition/ — loaded in Chrome, all three SVGs rendered, sections and console checked | DONE |

GitHub Pages main/root build for b8a330b69ba7f5bc179145f94df2137c03a4f3be succeeded. Native Chrome loaded the public page, exposed dataset and evaluation sections, and rendered all three linked SVGs with readable labels and relative paths. DevTools Console reported 0 messages. All three PNGs were also reviewed locally. Source-date and font-fallback refinements are included in the subsequent audit/provenance commit; the final release is checked again before delivery.

Submit this URL: https://alicialuguyun.github.io/STATS401---Clinical-Trial-Attrition/

Numerical evidence: data/processed/validation.json (all 403 arms, 1,896 reasons, 38 pairs; raw hashes and deterministic rebuilds). Manual evidence: docs/MANUAL_RECORD_CHECKS.md. Recheck deployed bytes with `python3 scripts/check_site.py`; a network-enabled environment is required.
