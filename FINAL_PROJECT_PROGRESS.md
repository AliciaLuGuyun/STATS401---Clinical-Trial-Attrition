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

## 11. Editorial restructuring — September 28, 2026

This section supersedes the September 27 website organization above, without erasing its audit. **No additional statistical analyses, cohort changes, models or outcome measures were introduced.** Existing generated analytical outputs were rebuilt for verification and remain byte-identical to the pre-edit baseline. No commit, push or deployment.

### Previous narrative problem and new thesis
The research edition presented analysis types in sequence, giving context, regression, reporting and the paired finding similar weight. The new thesis is: overall attrition varies; aggregate rates can conceal randomized-arm asymmetry; the current evidence does not establish an explanation; increasingly specific questions demand more comparable information than the present extraction provides.

A critical scope correction is explicit throughout: the existing three-covariate model concerns **overall trial attrition**, not differential attrition. It cannot be presented as an attempted explanation of paired-arm gaps. The conceptual participant-to-information transition refers to analytical usability/comparability, not an established reporting-bias mechanism.

### Exact section order

1. Opening: **Who stays, who leaves?** Plain-language problem, no KPI strip or global controls.
2. Act 1: **How much attrition is there?** Distribution across all 82 usable trials; median 13.66%; pooled 3,275/20,949 = 15.63%; explicit transition inside the trial.
3. Act 2: **The same trial. Different rates of leaving.** Hero paired dumbbell; 38 rows; median absolute gap 3.52 pp; signed range −20 to +25; 14 experimental-higher, 19 comparator-higher, five equal. Two explicitly identified extreme examples include their small denominators.
4. Act 3: **Can trial characteristics explain the variation?** Compact overall-attrition coefficient plot; model scope and uncertainty explicit. Sensitivity specification and phase/sponsor distributions expand on demand.
5. Act 4: **As the question gets narrower, so does the usable evidence.** Verified 201→82→38→14 nested trial sets; unresolved effect-analysis step shown as text, not an invented zero.
6. Act 5: **What is actually available for each trial?** Reporting/extraction matrix provides evidence for the previous act, with distinct source-status and rule-status shapes.
7. Act 6: **What does the gap look like in people?** Linked trial spotlight, actual aggregate counts, original reasons and outcome cells on demand.
8. Final synthesis: **A single rate is only the beginning.** Variation, asymmetry, limited explanation and comparability constraints. Compact methodology/limitations follows in a closed disclosure.

### Visual and interaction hierarchy

**Primary:** full-height paired dumbbell, displayed directly in the page rather than trapped in an equally sized scrolling chart panel. Shared 0–100% arm-rate scale; signed pp difference text and zero interpretation. Absolute-gap order by default; signed and ID order remain available. Mobile layout keeps both arm endpoints and Δ together instead of requiring a long horizontal swipe.

**Secondary:** overall distribution with explicit median/IQR and the new analytical-eligibility progression. Stage bars have a shared 201-trial denominator, with numbers and rule text outside the bars.

**Supporting:** compact coefficient figure, folded phase/sponsor distributions, shorter reporting matrix viewport. **Details on demand:** trial source reasons/outcomes, technical assumptions, source/provenance/reproduction information.

Removed from the active narrative: KPI strip, global filter panel, separate “model sensitivity” act, continuous-variable scatterplot and its selector, masking/intervention selectors. These analyses/exports and the original views remain in the preserved edition. Retained only phase/comparator filters for the hero, behind a disclosure; search/sort remain visible. Filters now affect the paired view only, so overview/funnel/model denominators do not silently change. Selection still links all trial views and persists locally. Reset restores the paired view and default selected trial. Reduced-motion and keyboard access remain.

Typography/whitespace and transitions connect questions; slate is the reference color and rust the highlight. No generic KPI cards or repeated chart titles. Source availability uses filled/open **circles**; extraction rules use **squares** for passing and outlined rust **triangles** for review/failure. Absence of a numeric primary cell is explicitly different from absence of an outcome module. All 201 have outcome modules.

### Cohort-nesting proof

`scripts/validate_story.py` compares unique NCT ID sets from:

- `data/analysis/trial_metrics.csv`: all 201; `usable == True` gives 82;
- `data/analysis/differential_attrition.csv`: 38 unique paired IDs;
- `data/analysis/outcome_review_candidates.csv`: 14 rows / 14 unique IDs.

Verified **82 ⊂ 201; 38 ⊂ 82; 14 ⊂ 38**, with zero membership exceptions. All 38 contain numeric primary-result information. `final/eligibility.json` preserves full memberships, labels and source-file SHA-256 hashes. Thus nested stages are legitimate here. The funnel is explicitly about trial eligibility under our extraction rules, not participant counts, missing-record counts or measured bias. “No defensible harmonized effect analysis yet” is a methodological status, not a fifth numerical stage. Endpoint timing, analysis sets, adjustment, missing-data handling and direction remain the barriers among the 14 candidates.

### Preservation and safeguards

Before editing, copied the entire working `final/` byte-for-byte to **`research-2026-09-27/`**, a directly runnable sibling with valid relative links. Archived prior progress text, browser-check script and browser receipt in `docs/research-edition-2026-09-27/`. `docs/NARRATIVE_BASELINE.json` records backup checksums and protected hashes for raw/processed/analytical data, analysis/validation scripts, original root site and browser payload. Rebuilt artifacts and backup match these pre-edit hashes.

No raw modifications, new acquisition, changed attrition denominator, expanded cohort, inferred arm type, derived treatment effect, causal assertion, claim of higher experimental attrition in general, or inference that nonsignificant intervals prove characteristics do not matter. No attempt to use the overall-attrition model as a differential-attrition model. All prior flags remain accessible in methodology: 51 multiple periods, 106 mapping flags (overlap), 11 enrollment discrepancies, zero-completion anomaly, sponsor extraction imbalance and 39-trial exact calendar-span coverage.

### Validation and visual review

- Rebuilt data with unchanged `scripts/deepen.py`; reran `scripts/validate.py` and `scripts/validate_deep.py`: PASS, original 201/330/1,888/38 checks intact.
- New `scripts/validate_story.py`: PASS for numerical editorial claims, set membership, model response scope, all protected output hashes and backup hashes.
- Updated `scripts/check_final.cjs`: real Chrome checks chapter order, numerical text versus exports, stage widths versus counts, four-stage endpoint semantics, distinct source/rule encodings, selection/keyboard/Escape, signed/absolute/ID sorting, phase/comparator filters, search/empty/reset, reporting filters/year sort, persistent selection, sensitivity and reason shares. Preserved research edition loads independently with original 82/38/201 marks.
- Desktop 1440px and narrow 390/768px: no page overflow, required asset failures or JavaScript errors. Phone hero specifically checked for both endpoints and Δ in a compact layout.
- Screenshots of opening, all narrative sections and mobile reviewed. Corrected a clipped difference-column header and undersized coefficient labels; adapted the hero for phones. Static default state shows all pairs; no hidden interaction is required to see the finding.
- Browser receipt/source hashes: `docs/FINAL_BROWSER_CHECK.json`; source nesting proof: `final/eligibility.json`. Screenshots remain in `/private/tmp/stats401-story-*.png`.

### Remaining weaknesses

The full 38-row hero is intentionally long; whether readers absorb its pattern in one pass needs actual reader testing. Supporting dense charts/matrix can still require internal scrolling on narrow screens. The narrative's explanatory limits remain real: we did not model paired gaps and cannot infer treatment-effect consequences. The 14 outcomes need adjudication before any effect comparison. Final course deliverables/complex-view approval are unchanged and not claimed complete. Human story-comprehension/usability evaluation is planned, not performed.

Local preview: `http://127.0.0.1:8000/final/`. Preserved edition: `http://127.0.0.1:8000/research-2026-09-27/`.


## September 28, 2026 — Coordinated Attrition Map redesign

### Primary visual and shared state

Replaced the sequential editorial layout with a large map of the same 38 reliable paired trials. X is `pair.absolute_difference_pp`, the absolute experimental-minus-comparator attrition difference in percentage points (0–30 pp axis). Y is the existing overall trial attrition, `1 − sum(COMPLETED)/sum(STARTED)`, displayed on a 0–100% scale. No redefined denominator, jitter, new cohort or new analysis. The vertical 3.52 pp median is explicitly descriptive, not a clinical threshold. Two annotations identify the highest overall rate and largest absolute gap within these 38.

The adjacent panel shows experimental/comparator rates, actual completed/STARTED counts, non-completion counts, signed difference, overall rate and design metadata. Completed/non-completed bar segments use those same counts. On phones the map comes first, followed by the panel. Three compact supports underneath show the 82-trial overall distribution, 38-pair gap distribution and verified 201→82→38→14 evidence progression. A stage tick indicates selected-trial membership; 14 remains a review set, not a treatment-effect estimate.

Map, both distributions, dumbbell, matrix and search use one selected NCT ID persisted in localStorage. Hover is temporary inspection; click/tap or Enter/Space selects. Search supports NCT, title and intervention; reset restores the default trial. Nonpaired records remain searchable and inspectable but are never inserted into the map with zero gaps. Unusable records show unavailable rates rather than invented counts.

### Hierarchy and prose

The 38-row dumbbell is preserved behind “Compare all paired trials,” retaining signed/absolute/ID sorting. The unchanged overall-attrition model and sensitivity view are inside “Explore trial characteristics”; they do not model arm asymmetry. Source availability and extraction-rule eligibility retain distinct matrix encodings inside a secondary disclosure. Original reasons, outcomes, definitions and limitations remain accessible on demand.

Measured default visible **paragraph** words in real Chrome, with the same default selected trial and including below-fold copy but excluding closed disclosures: **984 → 77, a 92.17% reduction**. This metric excludes headings, axes, controls and table text; it is not a claim that every visible word declined by that amount. The main explanation now comes from the two axes, selected counts and compact distributions.

### Preservation and validation

Before editing, copied all seven files from the prior final edition byte-for-byte to `editorial-2026-09-28/`. Hashes are in `docs/MAP_BASELINE.json`; all verified unchanged. Archived the earlier progress, browser script and receipt in `docs/editorial-edition-2026-09-28/`. Earlier progress entries and the research backup remain intact.

Rebuilt with unchanged `scripts/deepen.py` and reran `scripts/validate.py`, `scripts/validate_deep.py`, and `scripts/validate_story.py`: PASS. Raw, processed and analytical hashes, browser data payload, original pipeline and prior research edition match the existing protected baseline. Deep validation checked 201 trials, 330 outcomes, 1,888 outcome cells and 38 pairs with a byte-identical rebuild.

Updated `scripts/check_final.cjs`: PASS in Chrome 153. Independently checked all 38 map coordinates against verified exports; selected-trial rates and bar widths; linked selection from map, distributions, dumbbell and matrix; partial/exact/no-result search; keyboard/Escape; persistence/reset; nonpaired exclusion; all dumbbell sort orders; matrix filter/source-rule counts; model sensitivity; original reason share. No JavaScript errors or failed required assets. Desktop 1440px and 390/768px checks pass, with no document overflow. Screenshots visually reviewed at desktop and phone widths. Fixed an annotation leader that intercepted point clicks by disabling its pointer events.

Receipt: `docs/FINAL_BROWSER_CHECK.json`. Screenshots: `/private/tmp/stats401-map-*.png`. The protected analyses and both backups are unchanged. No staging, commit, push or deployment.

### Remaining limits

Coincident trial coordinates can overlap; search and keyboard selection retain access without jittering meaningful positions. Small screens stack the supports; dense secondary charts can scroll internally. Actual reader usability evaluation remains unperformed. The existing 14 outcome candidates still require adjudication before any harmonized treatment-effect comparison. This pass changes presentation only.

Preview: `http://127.0.0.1:8000/final/?edition=attrition-map`. Prior editorial version: `http://127.0.0.1:8000/editorial-2026-09-28/`.


## September 28, 2026 — Publication validation

User authorized publication of the existing work. All original analytical checks and full Chrome tests were repeated successfully, including an isolated export of the staged Git tree served under the actual GitHub Pages repository prefix. Numerical outputs and both preserved versions match their hashes. Pages remains configured for main/root; no new site or workflow. Raw snapshots, environments, caches, screenshots and browser runtime artifacts are excluded; compact validation JSON receipts remain intentional audit documentation. Publication results are verified separately after the normal push.
