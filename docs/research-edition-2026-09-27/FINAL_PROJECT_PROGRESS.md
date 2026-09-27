# Final project research edition — September 27, 2026

Local development checkpoint, **not a finished final submission**. No commit, push or deployment in this session. Correct repository: `STATS401---Clinical-Trial-Attrition`, branch `main`, baseline `8ca08cf28ade5dc701ceb2f6a911c6ee31848257`. Initial working tree was clean. The original `index.html`, `style.css`, static figures, proposal and interim pipeline remain unchanged. New website: `final/index.html` (serve over localhost; do not open with file://).

## 1. Current inventory

The entire proposal was read; the existing README, requirements, plan, log, dictionary, figures/site and processing/validation code were inspected. The starting implementation was three static Matplotlib figures embedded in HTML, with no JavaScript or D3 state. Existing definitions and exact arm-link logic were checked against source rather than assumed correct.

Source: ClinicalTrials.gov v2 API, immutable September 13 snapshot, source processing date September 11, 2026. Four local JSON pages contain 335 candidates (~23 MB decimal). SHA-256 verified against manifest. No new registry records acquired. No individual patient records. Raw files remain ignored and untouched.

| Data/output | Unit | Rows / coverage |
|---|---|---:|
| Raw pages | Study object, NCT ID | 335 candidates |
| `data/processed/trials.csv` | Eligible NCT ID | 201 |
| `data/processed/arms.csv` | Trial × group × single period | 403, including flagged mappings |
| `data/processed/reasons.csv` | Trial × group × period × original reason entry | 1,896 |
| Usable attrition subset | Trial / mapped arm | 82 / 221 |
| `data/analysis/differential_attrition.csv` | Unambiguous two-arm trial | 38 |
| `data/analysis/trial_metrics.csv` | Eligible NCT ID, extended attributes and QC | 201 |
| `data/analysis/arm_metrics.csv` | Existing single-period group, extended export | 403 |
| `data/analysis/reporting_completeness.csv` | Eligible NCT ID | 201 |
| `data/analysis/primary_outcomes.csv` | NCT ID × original outcome index | 330 |
| `data/analysis/primary_outcome_cells.csv` | Outcome × class × category × measurement index | 1,888 |
| `data/analysis/outcome_review_candidates.csv` | Preliminary MADRS-change candidate outcome | 14 outcomes / 14 trials |
| `final/data.json` | Derived linked browser payload | 201 trials with nested arms, reasons and outcome cells |

Other new CSVs: `variable_coverage`, `subgroup_summary`, `rank_associations`, `arm_mapping_audit`, `model_coefficients`, `model_diagnostics`, `reporting_by_year`. Detailed source paths/units are in `docs/EXTENDED_DATA_DICTIONARY.md`. `summary.json` contains computed findings; `validation.json` records independent checks and deterministic rebuild hashes.

## 2. Data-quality audit

Cohort definition remains unchanged: completed interventional studies with Phase II/III present; randomized parallel allocation; structured results; explicit major-depression condition label; mixed bipolar/schizophrenia labels deferred. The conservative condition screen is not a clinical adjudication. Counts: 335 → 270 randomized → 252 parallel → 211 explicit condition labels → 201 after mixed-diagnosis deferral.

| Candidate variable | Present among 201 eligible | Present among 82 usable | Interpretation |
|---|---:|---:|---|
| Enrollment | 201 | 82 | Registered count, with ACTUAL/ESTIMATED type preserved |
| Valid trial STARTED and COMPLETED | 82 | 82 | Derived only after every attrition rule passes; other records can have source counts |
| Completion year | 193 | 80 | Registry study completion, not publication or treatment duration |
| Exact-date calendar study span | 87 | 39 | Start to completion; recruitment included, **not participant follow-up** |
| Intervention type set | 201 | 82 | All registered intervention types, including comparators/co-interventions |
| Sponsor class | 201 | 82 | Lead sponsor class, not complete funding history |
| Masking | 201 | 82 | Registered category; not a quality score |
| Allocation | 201 | 82 | All RANDOMIZED, so no within-cohort comparison |
| Protocol arm count | 200 | 82 | One missing list stays missing, not zero arms |
| Phase | 201 | 82 | Original combined labels retained |
| Listed location count | 192 | 79 | Registered locations, not verified active recruiting sites |
| A harmonized number randomized | 0 derived | 0 derived | Not inferred from STARTED or enrollment; no common structured field extracted |

Missingness is explicitly counted in `variable_coverage.csv` for both cohorts. The term “missing” for derived measures includes failure of eligibility/QC; it does not assert the underlying registry never reported counts. Month/year-only dates are not assigned arbitrary days. Empty location lists are not interpreted as zero-site trials.

**Reporting versus extraction:** all 201 eligible trials have flow groups/periods, completion counts for every group-period, and outcome modules. 160 have numeric reason entries. 199 have at least one numeric primary-result cell; NCT01085812 and NCT03321526 do not. These are presence indicators, not proofs of completeness, valid analysis units or comparable estimands. Single-period rule passes 150, exact arm bijection 95, full attrition rules 82. 51 multi-period and 106 unresolved mappings overlap.

Selection is substantial: 52/155 (33.5%) industry trials pass, versus 28/43 (65.1%) OTHER. Phase III only: 34/109; Phase II only: 40/78. These are differences in **our extraction coverage**, not automatically trial reporting quality. Do not generalize the 82-trial distribution to all depression trials.

Interventions are especially unbalanced: DRUG alone covers 66 usable trials; every other intervention-type combination has 0–4. Sponsor FED and NIH have one usable trial each; masking NONE has two and SINGLE four. Show their records but do not infer stable subgroup differences. Median ticks require n ≥ 5 as a display rule, not a significance cutoff.

## 3. Attrition definitions and audit

- Arm: `1 − completed / started`, sole participant-flow period; STARTED > 0 and 0 ≤ COMPLETED ≤ STARTED. Counts must be participant counts, never numUnits. Missing counts remain missing.
- Trial: `1 − sum(completed) / sum(started)` across all validated mapped groups, never average arm percentages.
- Enrollment: `protocolSection.designModule.enrollmentInfo.count`; type retained. It differs from summed STARTED in **11/82** usable trials. NCT03866174 reports enrollment 347 but STARTED 104; substituting enrollment would be seriously misleading.
- STARTED is explicitly **not** relabeled “number randomized”: timing/analysis population may differ from randomization.
- Completion: reported flow milestone, not necessarily treatment adherence, primary outcome ascertainment, recovery or study completion status.
- Non-completion: STARTED minus COMPLETED in that period; not every record implies voluntary withdrawal.
- Reasons: original `dropWithdraws.type` plus `reasons.numSubjects`, indexed back to raw entries. No synonymous labels merged. Missing reason tables are not zero reasons.
- NCT00149643 reports zero completions in both arms, yielding 100% numerically. Keep it labeled in the main data; show an explicit sensitivity without it. No assertion that all participants truly withdrew.

The existing 82-trial measure is intentionally conservative. Requiring protocol arm matching is necessary for treatment/comparator interpretation but more restrictive than a pure sum of flow groups. A broader overall-only cohort could be justified after a separate period/group audit; this pass does not silently expand the estimand or cohort.

## 4. Arm-mapping rules

Exact flow title to protocol label after **only** case folding and whitespace normalization. Require one match per group, a bijection covering every protocol arm, a single period, participant units and valid counts. No fuzzy matching, ordering assumptions or treatment inference from drug names. The new `arm_mapping_audit.csv` exposes every flow-group match count, linked protocol type and trial-level bijection.

Paired analysis requires exactly two groups, one EXPERIMENTAL and one PLACEBO_COMPARATOR, ACTIVE_COMPARATOR, SHAM_COMPARATOR or NO_INTERVENTION. “Treatment” means the registry experimental designation, not a claim the comparator is untreated. 38 trials qualify. Other records retain an explicit pair-status reason rather than an invented comparator. Outcome groups have independent OG identifiers: a separate exact title match is checked; FG and OG IDs are never joined by numeric suffix.

## 5. Analyses completed

### Distribution and pooled denominator
82 trials: 20,949 STARTED, 17,674 COMPLETED, 3,275 non-completions. Median trial rate **13.66%**, IQR **8.54–18.74%**. Count-pooled proportion **15.63%** is size-weighted and not an equal-trial mean or a meta-analysis. The prior 13.1% median used 80 trials with known year; the new distribution uses all 82 valid rates, including two with missing year. This is a denominator change, not a contradiction.

Omitting the flagged 100% record: 81 trials; median 13.27%, pooled 15.35%. The sensitivity is explicit and does not remove the record from exports/default charts.

### Between-trial exploratory comparisons
All eligible and usable subgroup counts, medians, IQRs and pooled proportions exported. Continuous rank associations (Spearman, descriptive, no p-value screening):

| Variable | Complete n | Spearman ρ with attrition |
|---|---:|---:|
| Enrollment | 82 | −0.006 |
| STARTED | 82 | −0.003 |
| Completion year | 80 | −0.278 |
| Listed sites | 79 | −0.046 |
| Exact calendar study span | 39 | +0.043 |

Year association remains −0.260 without the anomaly, but heterogeneous follow-up, cohort composition and registry selection preclude a temporal improvement claim. Calendar span has weak coverage and the wrong meaning for participant treatment duration; it is available in the exploratory foldout with caveats, not a headline explanation.

### Differential attrition
38 pairs: experimental higher in 14, comparator higher in 19, equal in five. Median signed difference −0.24 pp; median absolute difference **3.52 pp**. Range −20 to +25 pp. Small denominators matter:

| Trial | Experimental/comparator STARTED | Signed difference |
|---|---:|---:|
| NCT02176291 | 20 / 11 | +25.0 pp |
| NCT03433339 | 10 / 10 | −20.0 pp |
| NCT03866174 | 51 / 53 | −18.79 pp |
| NCT04019704 | 163 / 164 | +14.17 pp |

No pooled treatment contrast, significance labels, effect-of-treatment inference or arbitrary large-difference threshold. All pairs appear, sortable by signed/absolute difference.

### Small multivariable sensitivity analysis
Equal-trial OLS, continuous attrition in percentage points; intercept plus log₂(STARTED), INDUSTRY versus all other sponsor classes, and presence of Phase III versus no Phase III. All 82 have these covariates. Four parameters; full-rank design verified. No variable selection, imputation, outcome threshold, validation-as-prediction claim or patient-level independence assumption. Calendar span is too incomplete and intervention classes too sparse for this small model.

Trial bootstrap: 2,000 resamples, seed 401, percentile 95% intervals; any rank-deficient resamples skipped and retained count reported (2,000 here). HC3 robust standard errors and per-trial residuals/leverage also exported. Equal-trial weights answer a trial-level question rather than allowing the largest trial to dominate. Bootstrap intervals are conditional on this selected empirical cohort, not population guarantees.

| Covariate | All 82 estimate (95% bootstrap interval), pp | Without zero-completion record, pp |
|---|---|---:|
| Doubling STARTED | +2.22 (−1.67, +7.32) | +1.12 |
| Industry vs other | −10.07 (−29.00, +4.19) | −4.84 |
| Any Phase III | −4.68 (−14.12, +3.29) | −2.33 |

All intervals cross zero in both specifications. Association coefficients are unstable, especially sponsor. Main fitted values happen to be 9.25–26.64%; max leverage 0.153. Linear models can still violate the 0–100% range in other data; this is a sensitivity aid, not a prediction engine. Unmeasured confounding, clustered sponsors/drug programs and the bounded skewed response remain limitations; HC3/bootstrapping do not remove them.

### Reasons and outcome feasibility
152 usable arms / 55 trials have reconciling reasons (2,510 non-completions, 83 original labels). Another 69 usable arms lack reason sums. The old aggregate reason figure is preserved. New spotlight permits counts or within-arm shares only if reasons reconcile and non-completions > 0. Original labels remain visible; a sum matching does not prove mutually exclusive or correct coding.

330 primary outcomes have **306 distinct titles**. Title-only scale screening identifies 117 MADRS-related, 44 HAM-D/HDRS-related and 169 other/unclear outcome rows; these are not harmonized endpoints. All 38 paired trials have numeric primary results. A conservative screen finds **14 potential MADRS-change outcomes** with one numeric cell per each of two exactly linked outcome groups and MEAN/LEAST_SQUARES_MEAN. This is only a review queue.

Inspection reveals 3-week, 4-week, 6-week, 8-week, 29-day, and averaged-over-six-weeks outcomes; run-in/randomization time origins; mixed mITT/FAS populations; LOCF versus repeated-measures methods; adjusted versus ordinary means; positive versus negative reported changes. Example: NCT04019704 reports 15.91 versus 12.04 as MADRS change values; the sign must be understood from registry narrative before any direction standardization. NCT03595579 averages across six weeks rather than reporting one endpoint. The two TC-5214 records share a title/timeframe, but two records are not enough for a credible attrition–effect association and shared drug programs are not independent evidence.

**Attrition × treatment effect: not yet defensible across the cohort.** A narrowly adjudicated subset may eventually be possible, but the 14-row screen is not an analysis-ready effect dataset. No common treatment-effect metric has been invented.

## 6. Visualization redesign and rationale

The new edition is `final/`; the old working page/figures remain accessible. D3 7.9.0 is bundled locally (existing local copy; copyright header/version checked; official ISC license retained). No framework, CDN, model service or runtime network dependency.

| View / question | Data, marks/channels | Interaction / purpose | Integrity boundary |
|---|---|---|---|
| I. Distribution: how variable is attrition? | 82 trial dots, x=rate, deterministic collision y, constant area; median and IQR | Hover/focus counts; select a trial | Full 0–100%; anomaly annotated; y encodes nothing |
| II. Context: do distributions differ? | Small multiple strip distributions; same x scale; counts usable/eligible; median if n≥5 | Switch phase/sponsor/masking/intervention; linked filters; optional continuous scatter | Sparse categories shown without stable subgroup claims |
| III. Imbalance: which arm loses more? | Connected comparator diamond and experimental circle on shared rate scale; signed Δ text | Absolute/signed/ID sort, comparator filter, select | Explicit arm types, all 38 pairs, denominators in tooltip/detail |
| IV. Sensitivity: are associations stable? | Coefficient dots and 95% bootstrap interval lines; zero reference | Toggle all 82 vs 81 without anomaly | Fixed sample clearly labeled; not recomputed on opportunistic filters |
| V. Reporting: what is present vs usable? | Trial × indicator matrix, symbols plus fill; separation of reporting and extraction columns | All/usable/review, year/ID ordering, selection | All 201; missing match ≠ bad reporting; numeric outcome ≠ comparable effect |
| VI. Spotlight: what lies behind the rate? | Within-arm 100% completion bars plus source metadata, original reason table and outcome cell table | Trial picker linked to every trial chart; reason count/share toggle | Missing or multi-period rates deferred; result values remain unharmonized |

Shared state: phase, sponsor and NCT/title search; select by click/Enter/Space; linked highlight; localStorage persists selected NCT only; selection remains visible in the spotlight even if filters exclude it, with a clear notice. Reset restores filters/selection. Model selector and local view choices have their own explicit scope. No brushing was added because categorical filters, search and sorting already serve the current tasks.

Restrained teal/rust, serif headings, clear hierarchy, no decorative cards/gradients. Shapes/text reinforce color. Focus indicators, native labels, screen-reader mark descriptions, escape-to-dismiss tooltips, reduced-motion support. On narrow screens charts retain readable text with internal horizontal scrolling; the page itself does not overflow. Only subtle CSS highlight transitions are used; no unnecessary animated data movement.

## 7. Current story

**Heterogeneity → trial context and selection → within-trial asymmetry → uncertainty of adjusted associations → reporting/interpretation limits → inspect the source trial.**

Strongest supported questions: How variable is registered-period non-completion? How much do explicitly paired arms differ? Which trials survive extraction, and what limits generalization? Which reasons are reported within reconciling arms? The subgroup/model sections provide context and caution, not a claimed explanation of causes.

## 8. Implemented and validated

- Extended extraction/EDA: `scripts/deepen.py`; deterministic outputs under `data/analysis/` and `final/data.json`.
- Independent source/model/rebuild audit: `scripts/validate_deep.py`; 201 trials, 330 outcomes, 1,888 outcome cells and 38 pairs.
- Original `scripts/validate.py` passes: all 403 arms, 1,896 reasons, raw hashes, formulas, mappings, exact interim reproduction.
- Manual cross-check: NCT04019704 enrollment/STARTED 327, completed 270, 43 listed locations, dates 2019-06-20 to 2019-12-05 = 168 days; NCT02176291 enrollment/STARTED 31, completed 26, month-only dates correctly produce no exact calendar span; NCT03866174 enrollment 347 vs STARTED 104, completed 92, 11 listed locations, 887 calendar days. Source means are not substituted for flow counts.
- Browser checks: `scripts/check_final.cjs` tests real Chrome, initial 82/38/201 counts, keyboard selection and linked highlights, industry filter 52/155, comparator/signed sort, 103 industry trials needing review, empty search, reset, persistent selection, sensitivity n=81, reason percentages, continuous-field missingness and 390px viewport page overflow. JavaScript errors and failed required assets: zero in tested paths.
- Screenshots visually inspected for distribution, subgroup/long intervention labels, dumbbell, coefficient intervals, reporting matrix and arm flow; narrow viewport reviewed. Mobile charts intentionally scroll horizontally. Tooltip word wrapping and chart minimum width were corrected after visual review.
- No human usability sessions conducted. No new published-page verification claimed: this is local only.

## 9. Blockers / unfinished work

1. Manual adjudication of 51 multi-period and 106 exact-label mapping flags (overlap), and the zero-completion anomaly. Need explicit per-trial source evidence, not fuzzy auto-matching.
2. Outcome harmonization: time origin/end point, scale version/direction, treatment context, analysis set/denominator, mean versus adjusted mean, missing-data method and suitable contrast uncertainty. Data already contain much of this narrative; interpretation is the bottleneck. Papers/protocols or registry analyses may be needed for unresolved estimands/covariances. Do not assume a shared outcome label resolves these issues.
3. Reason taxonomy requires a versioned original-label-to-category mapping with human review; no silent synonym folding.
4. Actual usability feedback; keyboard/screen-reader testing with people; additional devices. Current browser checks are not user evaluation.
5. Final course obligations: at least five meaningfully different interactive idioms, a qualifying complex representation, report, poster and demonstration still need a course-level audit. Six sections/seven SVGs alone do not establish compliance or teaching-team approval. The current completion bars are not a Sankey; no complex-view requirement is claimed satisfied.
6. Refreshing live course-linked rubrics remains separate; existing requirements are from user-supplied assignment text. This pass did not invent or change them.
7. No commit, push, publication or replacement of root page until reviewed/requested.

## 10. Highest-value next steps

1. Review period and arm links with a small explicit overrides table (NCT, source evidence, selected period, mapping, reviewer/date). Expand only after validation, then compare distributions before/after expansion to quantify extraction selection.
2. Manually adjudicate the 14 MADRS candidates before deciding whether any sufficiently coherent subset supports an effect comparison. Prioritize estimand compatibility over sample inflation. Additional acquisition is not currently necessary to establish feasibility; raw outcome modules are already local.
3. Test the coordinated system with classmates and decide whether the model sensitivity should remain a foldout. Develop a justified participant-flow/reason representation if it improves the story and meets the complex-view requirement; finish report/poster after the analytical cohort is stable.

Reproduce from root: `.venv/bin/python scripts/deepen.py`, `.venv/bin/python scripts/validate_deep.py`, then `python3 -m http.server 8000` and visit `/final/`. Existing setup in README pins NumPy 2.0.2; no new Python dependency. Optional Playwright check requires a separate Playwright installation and Google Chrome; it is not needed to run the website.
