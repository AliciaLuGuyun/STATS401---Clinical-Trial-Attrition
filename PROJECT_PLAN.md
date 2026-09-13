# STATS401 Project Recovery Plan

Status: BLOCKED for analytical/visualization implementation. This document is a recovery checkpoint, not an approved respiratory implementation plan. The located proposal concerns depression, and the intended project checkout remains unidentified.

## 1. Research Question
Preserve the five questions in PROJECT_PROPOSAL_SUMMARY.md. Resolve respiratory-versus-depression scope before selecting a primary question or dataset.

## 2. Audience
Recovered proposal: clinical researchers, biostatistics students and readers assessing retention/reporting. Confirm applicability after scope resolution.

## 3. Dataset
ClinicalTrials.gov is proposed, not acquired in this workspace. Raw/processed paths, observed size, missingness and quality remain unknown. Existing `data/` contains lab examples (students, cities and airline tweets), not verified clinical-trial data.

## 4. Data Preparation
No preprocessing authorized at this recovery checkpoint. After repository and topic resolution, specify acquisition → immutable timestamped JSON → linked trial/arm/reason tables → period/arm/reason validation → derived measures. For each step document input, operation, output, reason and responsible script. Never overwrite source records.

## 5. Exploratory Data Analysis
Deferred until cohort and data availability are verified. Candidate checks from proposal: inclusion counts, completeness, attrition distributions, paired comparisons and reason reconciliation. No analyses run.

## 6. Visualization Questions
Detailed data/task abstractions, marks, channels, scales, color, expressiveness, effectiveness, clutter, annotations, interaction and accessibility remain to be specified after recovery. The five sketches are candidates, not final decisions.

## 7. Candidate Visualizations
See PROJECT_PROPOSAL_SUMMARY.md for the proposal's five views. Before implementation, record required variables, filters, aggregation, all encodings, annotations, audience task, expected takeaway and requirement mapping. No claim of an expected empirical result yet.

## 8. Final Story
Deferred until observed data support a narrative. Maintain the attrition/reporting focus only if confirmed as intended scope.

## 9. Validation
Future checks: correct filters and denominators, zero starts, completed exceeding starts, missingness, category definitions, units, period selection, pairing, subgroup sizes and reason reconciliation. Confirm transformations and reproducible commands; avoid causal interpretations.

## 10. Deliverables
| Requirement | Planned output | Repository file | Status |
|---|---|---|---|
| Recovery documentation | State/proposal/requirements | PROJECT_LOG.md; PROJECT_PROPOSAL_SUMMARY.md; STATS401_REQUIREMENTS.md | DONE |
| Verified project identity | Correct local checkout and scope | PROJECT_LOG.md | BLOCKED |
| Live requirement verification | Verified Canvas record | STATS401_REQUIREMENTS.md | BLOCKED |
| Dataset/code/site/report/poster/demo | Paths assigned after checkout recovery | See requirements matrix | BLOCKED |

## 11. Work Breakdown
| Task ID | Description | Dependency | Expected output | Repository location | Status |
|---|---|---|---|---|---|
| R01 | Inspect local candidates and proposal | None | Recovery record | PROJECT_LOG.md | DONE |
| R02 | Extract supplied assignment and gaps | User attachment | Requirements matrix | STATS401_REQUIREMENTS.md | DONE |
| R03 | Resolve topic and intended checkout | User clarification | Confirmed project identity | PROJECT_LOG.md | BLOCKED |
| R04 | Verify live Canvas and linked instructions | Working access | Verified requirements | STATS401_REQUIREMENTS.md | BLOCKED |
| R05 | Inspect target repository/data/environment | R03 | Inventory and data feasibility | Target checkout | BLOCKED |
| R06 | Expand execution/design plan | R03–R05 | Full evidence-based task plan | PROJECT_PLAN.md | BLOCKED |
| R07 | Implement validated acquisition and five linked views | R06 | Reproducible project | Target checkout | BLOCKED |
| R08 | Report/poster/demo/deployment | R07 | Complete submission | Target checkout | BLOCKED |

## Synchronization and reproducibility
Do not initialize another repository or attach a guessed remote. Current root has no commit history or remote, so cannot be synchronized as the intended project. Preserve pre-existing untracked work. Once correct checkout is verified: inspect status, fetch safely, inspect divergence, review explicit diffs/staged paths, commit a coherent checkpoint and push normally. Never force-push or overwrite teammates' work.

Record runtime/package versions and all data/analysis/site commands when implemented; current requirements.txt is a lab environment, not verified project dependencies. Review data licensing, privacy and sizes before staging. Keep raw datasets local by default and document acquisition/placement. Preserve existing organization and README until the correct checkout is recovered.

# Current execution plan — Interim check-in, 2026-09-13

This section supersedes the historical recovery blockers above. User confirmed depression scope and authorized cloning the existing repository. Original proposal remains unchanged.

## Question and audience
How does reported participant non-completion vary across randomized depression studies, between paired arms, and across original reported reasons? Audience: clinical researchers, biostatistics students, retention/reporting readers. No ML or causal claims.

## Dataset and preparation
335 candidates; 201 conservatively eligible trials; 82 usable trials / 221 arms. Raw snapshot is local and immutable; exact filters, original fields, table units and missingness are in docs/DATA_DICTIONARY.md.

| Task | Input | Operation | Output | Reason / responsible script |
|---|---|---|---|---|
| Acquisition | ClinicalTrials.gov API | Paginate, archive bytes, hash | data/raw/2026-09-13 | Reproducible provenance; scripts/acquire.py |
| Cohort | Raw JSON | Explicit protocol/diagnosis screens | candidates.csv, trials.csv | Preserve scope and exclusions; scripts/process.py |
| Extraction | Single-period flow modules | Exact arm links, numeric QC, original reason extraction | arms.csv, reasons.csv | Avoid period/mapping guesses; scripts/process.py |
| Measures | Valid count rows | Sum trial counts, calculate rates, pair two arms | trials.csv, pairs.csv | STARTED denominators; scripts/process.py |
| Visualization | Committed processed CSVs | Ordered plots and exact plotting inputs | figures/, plot_*.csv, findings.json | Three proposal-aligned questions; scripts/figures.py |
| Page | Computed summaries | Render concise HTML | index.html | Milestone communication; scripts/build_page.py |
| Validation | Raw + processed + figures | Independent source comparisons/rebuild | validation.json | Verify correctness and reproduction; scripts/validate.py |

## Exploration and visual design
Only counts, QC, rate distribution, paired differences and original reason frequencies were examined. Completion year replaces inconsistent duration; missing years are omitted with a count. Full What/Why/How, marks/channels, scales, accessibility and interaction purposes are in docs/VISUALIZATION_DESIGN.md. Narrative: variation → paired imbalance → reported departures, with adjacent limitations. All observations are descriptive and drawn from actual data.

## Work breakdown and deliverables
| ID | Task | Dependency | Output/location | Status |
|---|---|---|---|---|
| I01 | Correct checkout and scope | User clarification | This checkout; project log | DONE |
| I02 | Immutable acquisition | I01 | data/raw/2026-09-13 | DONE |
| I03 | Process + QC + dictionary | I02 | scripts/process.py; data/processed; docs/DATA_DICTIONARY.md | DONE |
| I04 | Three static plots | I03 | figures/01–03; scripts/figures.py | DONE |
| I05 | Interaction and evaluation plans | I04 | docs/VISUALIZATION_DESIGN.md; index.html | DONE |
| I06 | Interim webpage/reproduction | I03–I05 | index.html; README.md | DONE |
| I07 | Numerical/visual/source checks | I06 | validation.json; manual record audit | DONE |
| I08 | Review diff, commit, push, Pages | I07 | Existing remote; docs/INTERIM_AUDIT.md | DONE |
| I09 | Verify published page in browser | I08 | docs/INTERIM_AUDIT.md | DONE |

Final report, poster, Sankey and five interactive views are deferred, not interim requirements. Next scientific work: team review of ambiguous multi-period/arm/diagnosis records and the all-zero-completion anomaly. No silent override of these records.
