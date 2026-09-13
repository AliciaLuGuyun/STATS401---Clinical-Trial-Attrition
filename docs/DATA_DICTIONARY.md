# Dataset and processing dictionary

## Raw dataset
Source: ClinicalTrials.gov v2 API, https://clinicaltrials.gov/api/v2/studies. Retrieval: 2026-09-13; exact UTC start/end, query, each page URL, byte size and SHA-256 are in `data/processed/source_manifest.json`. 335 unique candidate NCT IDs, four JSON response files (~24 MB), in `data/raw/2026-09-13/`. Full responses are local, immutable inputs and ignored by Git; no patient-level dataset is used.

Query parameters: `query.cond=Major Depressive Disorder`, `filter.overallStatus=COMPLETED`, `filter.advanced=AREA[StudyType]INTERVENTIONAL AND AREA[Phase](PHASE2 OR PHASE3) AND AREA[HasResults]true`, `format=json`, `pageSize=100`, `countTotal=true`. Pagination continues until no nextPageToken. Search expansion is not exact cohort membership.

Important original modules: `protocolSection.identificationModule.nctId`, `conditionsModule.conditions`, `designModule` (studyType, phases, designInfo.allocation/interventionModel/maskingInfo), `statusModule` (overallStatus, completionDateStruct), `sponsorCollaboratorsModule.leadSponsor`, `armsInterventionsModule.armGroups`, and `resultsSection.participantFlowModule` (groups, periods, milestones.achievements, dropWithdraws.reasons). Counts are parsed only from numSubjects, never numUnits or enrollment.

## Executable cohort and interim availability rules

| Sequential rule | Remaining | Interpretation |
|---|---:|---|
| API candidates | 335 | Candidate retrieval, not final eligibility |
| COMPLETED; INTERVENTIONAL; phase includes PHASE2 or PHASE3 | 335 | Recheck registry fields locally; mixed Phase I/II and II/III qualify when II/III present |
| allocation = RANDOMIZED | 270 | Exclude nonrandomized/unspecified allocation |
| interventionModel = PARALLEL | 252 | Exclude crossover, single-group and other models |
| hasResults true | 252 | Structured results available |
| Explicit major-depression condition label | 211 | Case-insensitive `major depress`, `depressive disorder, major`, or exact `MDD` |
| No bipolar/schizo condition label | 201 | Defer 10 mixed-diagnosis records; cannot separate MDD counts safely |

The proposal does not enumerate diagnostic synonyms or comorbidity rules. The last two rules are conservative *interim automated eligibility screens*, not a new permanent clinical definition: 41 broad/related-condition records and 10 mixed records remain in the candidate audit for later review. No age, geography, sponsor, intervention or year restrictions were added. MDD with other comorbidities remains eligible; diagnosis based on registry labels is a limitation.

Among 201 trials, 150 report a single flow period and 51 have multiple periods. No multi-period record is used for interim rates, and no first/longest period is guessed. 106 need protocol-to-flow arm mapping review; flags overlap. A trial is usable only if every flow group matches exactly one protocol arm label (case and whitespace normalized only), mapping is bijective, the period is single, units are participants, and all STARTED/COMPLETED counts are valid. 82 trials / 221 arms pass. Mapping strictness sacrifices coverage for auditability and must not be interpreted as poor trial quality. Numerical QC found no invalid STARTED/COMPLETED counts in the 403 extracted single-period arm rows.

For the landscape, two usable trials lack completion dates (`data/processed/validation.json` lists IDs); 80 appear. Completion year is the year from registered **study completion date**, not primary completion, enrollment, publication or individual follow-up time. No duration is calculated. A single “Overall Study” period may cover treatment and follow-up; the estimand is registered-period non-completion, not a common treatment-duration rate.

For paired differences, require exactly two mapped groups, exactly one protocol EXPERIMENTAL arm and one PLACEBO_COMPARATOR, ACTIVE_COMPARATOR, SHAM_COMPARATOR or NO_INTERVENTION arm. No label guessing or arbitrary pairing of multiple experimental arms. 38 trials qualify; 44 other usable trials do not qualify for this two-arm comparison. These are within-trial descriptive differences, not causal or significance claims.

## Tables and fields

CSV uses UTF-8; empty cells mean missing/not calculated, not zero. Booleans are `True`/`False`; an empty nullable Boolean means unavailable. Counts are integer numbers of participants. IDs/labels/categories are nominal; dates/years are temporal; counts/rates/differences are quantitative.

| Table | Rows / key | Fields and semantics |
|---|---|---|
| candidates.csv | 335; nct_id | title, original conditions joined by ` | `, eligible, semicolon-separated exclusion_flags, period_count |
| trials.csv | 201; nct_id | title/conditions, original phase labels joined with `/`, sponsor/name/class, masking, completion_date/year, period_count/title, flow_group_count, arm_mapping_complete, started/completed sums, attrition, qc_flags, usable |
| arms.csv | 403; nct_id + group_id + period_index | All single-period eligible flow groups, including flagged trial mappings; period_title, flow_title, protocol_label/type, started/completed/noncompleted, attrition, count_valid, reason_sum, nullable reason_reconciles, qc_flags |
| reasons.csv | 1,896; nct_id + group_id + period_index + reason_index + entry_index | Original reason_label and count/count_valid; zero-based source positions disambiguate potentially repeated labels; no assumption that the text is unique |
| pairs.csv | 38; nct_id | Experimental/comparator flow IDs, labels/type, original arm counts/rates and difference_pp |
| plot_landscape.csv | 80; nct_id | Exact landscape inputs, ordered by year and NCT ID |
| plot_pairs.csv | 38; nct_id | Exact difference inputs, ordered by signed difference then NCT ID |
| plot_reasons_all.csv | 83; reason_label | All eligible original labels ranked by reported_count, ties by label; reporting_trials counts trials reporting that label, including explicit zeros |

`attrition = 1 − COMPLETED/STARTED`; STARTED > 0 and 0 ≤ COMPLETED ≤ STARTED. Trial rate = 1 − sum(COMPLETED)/sum(STARTED); never an unweighted mean of arm rates. `noncompleted = STARTED − COMPLETED`. `difference_pp = 100 × (experimental attrition − comparator attrition)`.

`reason_sum` is missing if no reasons or an invalid count is reported; never assume absent reasons equal zero. `reason_reconciles` compares the full arm reason sum to STARTED − COMPLETED. Reasons plot uses only 152 reconciled arms from 55 usable trials: 845 reason rows, 2,510 reported non-completions. Another 69 usable arms have no reason sum; none has a nonmissing mismatched sum. 83 original labels are preserved byte-for-byte; the top 10 sum to 2,088. The remaining 422 counts are available in the full table. No harmonization or synonym merging is applied; a future mapping requires team review. Reconciliation does not prove mutually exclusive or clinically correct coding.

QC flags distinguish missing/ambiguous milestones, nonpositive STARTED, completed exceeding STARTED, nonparticipant units, unknown/duplicate groups, missing/multiple periods and unresolved arm links. See process.py and summary.json for actual occurrences. Rates can be numerically valid but substantively questionable: NCT00149643 reports STARTED 34/36 and COMPLETED 0/0. Retain the reported 100% with an explicit warning; do not claim all subjects truly dropped out.

## Reproducibility and data safety
Run acquisition into a **new** snapshot directory; the script fails if that directory exists. Processing verifies page hashes. Existing valid raw snapshot is reused for rebuilds. No manual CSV edits. `scripts/validate.py` cross-checks all 403 arm rows and 1,896 reasons against raw entries, recalculates all aggregates/pairs and re-runs processing and SVG generation for byte-identical output.

Raw full responses are not committed because they are ~24 MB and include unneeded registry fields. Small processed aggregate tables, source manifest, code and figures are committed for public reproducibility. They exclude contact information and patient-level details. New API downloads can differ as records change; the exact local historical snapshot must be preserved for exact raw-to-processed reproduction. Without it, the committed processed CSVs still reproduce the figures and webpage. Raw submission, if required later, is separate from public GitHub storage.

Definitions: https://clinicaltrials.gov/policy/results-definitions and https://clinicaltrials.gov/policy/protocol-definitions. Read alongside source record context; arithmetic alone does not validate reporting semantics.

## Source reuse review
The official download documentation states that data use is subject to the ClinicalTrials.gov terms: https://clinicaltrials.gov/data-api/how-download-study-records and https://clinicaltrials.gov/about-site/terms-conditions. The terms page did not expose its full text in the available web reader; no blanket license or public-domain claim is made. We publish only necessary derived aggregate facts with source/NCT attribution, not full registry documents, attachments, contacts or patient records. No separate license is assigned to third-party data.
