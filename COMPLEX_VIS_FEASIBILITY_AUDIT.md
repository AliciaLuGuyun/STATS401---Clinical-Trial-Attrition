# Complex visualization feasibility audit

Date: 2026-09-28. Audited commit: `b4e31963505d3073e49adb88a0f1254c2f1bfe9f`, main. Scope: read-only inspection and calculations, with this requested Markdown deliverable as the sole repository addition. No site, pipeline, source record, derived table, dependency or Git history was changed. No acquisition or new inferential analysis.

## 1. Decision

**Recommend a coordinated parallel-coordinates explorer as the main complex representation, plus a trial-preserving participant-flow Sankey as a second substantial idiom.** Keep the Attrition Map as hero. Use the same selection and explicit population state across views. The parallel-coordinates view directly addresses combinations of trial characteristics; the Sankey makes aggregate denominators tangible. Do not rely on a scatterplot, dumbbell or the existing binary matrix alone to satisfy the professor's complexity feedback.

Current five-view count: there are five plausible distinct interactive idioms if the coefficient plot is included (scatter, distribution, dumbbell, coefficient intervals, reporting matrix). **The numerical quota is plausible; a defensible pass on the full requirement of meaningfully different, coherent, coordinated views is not yet secured.** The coefficient view is weakly integrated and overlaps the point/interval vocabulary; duplicate swarms, metadata tables and passive membership bars must not inflate the count. **There is currently no clearly qualifying complex representation.** At least five meaningful interaction types already exist, although filtering is local rather than coordinated.

Recommended exact five primary views: **Attrition Map; Parallel-coordinates explorer; Participant-flow Sankey; Paired-arm dumbbell; Reporting/evidence matrix.** The selected-trial inspector and compact cohort counts are interface support, not extra rubric views. An existing overall distribution can remain a small contextual widget but is not counted as a sixth primary visualization.

Course basis: the user's latest supplied requirements and professor feedback, cross-checked against `STATS401_REQUIREMENTS.md` and `docs/STATS401_assignment_user_supplied.txt`. Live Canvas/rubric verification was not repeated; the existing requirements document records earlier access limitations. A rubric listing multidimensional representations makes a genuine brushed multi-axis explorer a strong fit, not a guarantee of instructor approval. Present the concrete specification to the professor before investing in polish. Deadline feasibility below refers to the recorded October 16 deadline, whose timezone remains unverified, and assumes existing D3 and two contributors, not a promised schedule.

## 2. Evidence and definitions

Inspected proposal, requirements, dictionary, progress, process/deepen/validation code, all active HTML/JS controls, immutable four-page raw snapshot, processed tables and analysis/browser payload. Checked existing protected SHA-256 baselines without rerunning scripts that write outputs. Initial working tree was clean. The numerical audit below reads the existing data; the reproducible calculation is included in the appendix.

| Resource | Unit | Verified coverage |
|---|---|---:|
| Raw snapshot, September 13; source processing September 11 | Registry study JSON | 335 candidates |
| `data/analysis/trial_metrics.csv` | NCT ID | 201 eligible; 82 usable |
| `arm_metrics.csv` | NCT × flow group × sole period | 403 arms from 150 single-period trials; 221 arms in the 82 usable trials |
| `arm_mapping_audit.csv` | NCT × raw flow group | 592 rows |
| `data/processed/reasons.csv` | NCT × group × period × reason entry | 1,896 entries; 845 in usable trials |
| `differential_attrition.csv` | NCT with one explicit experimental and one valid comparator | 38 trials / 76 arms |
| `primary_outcomes.csv` / `primary_outcome_cells.csv` | Outcome / structured measurement cell | 330 / 1,888 |
| `outcome_review_candidates.csv` | Screened paired outcome | 14 rows / 14 trials, not harmonized effects |
| `final/data.json` | Browser package of these entities | 201 trials; same rates and pair definitions |

Attrition remains `1 − COMPLETED/STARTED`. Trial attrition divides summed arm counts, not the unweighted mean of arm rates. Signed gap is experimental minus comparator in percentage points; absolute gap is its magnitude. STARTED is a registered-period count, **not a harmonized number randomized**. A sole period may encompass follow-up. Enrollment is a distinct protocol field and differs from STARTED in 11/82 usable trials and 6/38 pairs. No missing value is zero-filled.

Mappings require normalized case/whitespace label matches, a unique one-to-one protocol/flow arm correspondence, and valid counts. A paired trial must have exactly two arms, one EXPERIMENTAL and one explicit comparator; the 38 have 27 placebo, 9 active and 2 sham comparators. Do not call all comparators placebo or every second row control.

51/201 trials have multiple flow periods; 106/201 fail exact arm mapping (overlap). All 82 usable trials have one period. The flagged zero-completion trial NCT00149643 is in the 82 but not the 38; keep its warning/sensitivity rather than silently removing it.

## 3. Participant-flow feasibility

### Count presence versus usable analytical flow

| Check | Trials | Interpretation |
|---|---:|---|
| Raw STARTED present for every group × period | 201/201 | Exactly one nonnegative integer `numSubjects` entry and no `numUnits`; presence only |
| Raw COMPLETED present under the same check | 201/201 | Presence only |
| Both raw milestone checks | 201/201 | Not evidence that periods can be added or mapped |
| Single-period positive STARTED and valid COMPLETED ≤ STARTED in all extracted arms | 150/201 | 403 arithmetic-valid arms; includes unresolved protocol mapping |
| Full existing count/period/mapping eligibility | 82/201 | Both trustworthy for the existing analysis; 221 arms |
| Reliable experimental/comparator pair | 38/201 | 76 arms, exactly one pair per NCT |

Thus “201 have counts” must never be presented as “201 can enter the validated flow.” For the current scientific definitions, use 82 for a general arm flow, or **38 for the primary paired flow**.

| Population | STARTED | COMPLETED | Not completed |
|---|---:|---:|---:|
| 82 usable trials / 221 arms | 20,949 | 17,674 | 3,275 |
| 38 paired trials / 76 arms | 7,920 | 6,721 | 1,199 |
| Experimental arms within 38 | 3,936 | 3,348 | 588 |
| Comparator arms within 38 | 3,984 | 3,373 | 611 |

These are **trial participations**, not proven unique people across studies. The registry lacks participant identifiers to deduplicate cross-study enrollment. Within the chosen single-period, uniquely mapped records, each arm's count enters once; flow columns must not be added together as if they contained different participants. Multiple-period totals risk counting the same people repeatedly and are excluded without selecting a convenient period. Even one-period studies can use different follow-up windows, so pooled proportions are descriptive of included registrations, not standardized retention estimates or experimental-versus-control effects.

### Withdrawal reasons

| Check | All extracted eligible single-period records | 82 usable | 38 pairs |
|---|---:|---:|---:|
| Raw numeric reason entries somewhere in study | 160/201 (includes multi-period raw records) | 55/82 | 23/38 |
| Trials with all extracted arms' reasons reconciling | 112 | 55 | 23 |
| Reconciled arms | 308 | 152 | 46 |
| Reconciled arms with positive non-completion | 298 | 145 | 44 |
| Distinct exact extracted labels | 159 | 83 | 38 |

The 112-trial count includes mapping-ineligible studies and is **not an expanded valid cohort**. In usable trials all 55 reason-reporting trials reconcile across their arms: 152 reconciled arms, 69 arms with no usable reason sum, no observed non-reconciling arms in that usable subset. Those 55 represent 17,116 STARTED and 2,510 reason-counted non-completions; the remaining 765 non-completions have no reconciled breakdown. In pairs, the 23 reason-reporting trials represent 5,932 STARTED and 814 non-completions; the other 15 contain 385 non-completions without a reason breakdown.

Exact labels contain capitalization variants, synonyms, administrative decisions and combined narratives. Case/whitespace normalization alone leaves 74 labels among 82 trials and 37 among pairs; **this is an audit count, not a proposed taxonomy transformation**. Examples include “Withdrawal by Subject,” “Withdrawal of Consent,” “Voluntary withdrawal,” “Other,” and “non-compliance; lack of efficacy; etc.” Some descriptions concern treatment discontinuation, others missed follow-up. Equal sums are necessary but **do not prove participant-level mutual exclusivity, complete causal explanations, or common definitions across studies**. No participant-level membership is present to test that. Reasons are registry-reported accounting categories, not established causes.

### Intervention grouping

`intervention_types` is the sorted set of **all registered intervention types in the trial**, including comparator/co-interventions. It is not an experimental-treatment mechanism. Keeping each full combination as one category yields unique trial membership:

| Exact set in 38 pairs | Trials | STARTED |
|---|---:|---:|
| DRUG | 27 | 6,875 |
| BEHAVIORAL + DRUG | 2 | 200 |
| BEHAVIORAL + DRUG + OTHER | 3 | 278 |
| DEVICE | 2 | 222 |
| DIETARY_SUPPLEMENT + DRUG | 2 | 34 |
| DRUG + OTHER | 2 | 311 |

Among 82, DRUG is 66 trials / 19,278 STARTED; other combinations have 2–4 trials. Never replicate a combination trial into each component and then sum its participants. No verified experimental-drug class/mechanism taxonomy currently exists.

### Separate Sankey options

| Version | Validity and coverage | Assumptions and interpretation | Recommendation |
|---|---|---|---|
| A1: intervention set → arm role → completion | Conditionally valid for 38, 7,920 participations; 82 possible only with all original arm types, including OTHER and multi-arm studies | Preserve full combined type and trial-stratified paths. If role nodes merge categories before status, downstream category-specific completion cannot be inferred from mixed ribbons. Counts dominated by large drug trials; role totals are not pooled treatment effects | Feasible overview, but category stage adds little beyond DRUG dominance. Do not make it the principal complex view |
| A2: intervention set → arm role → reason | Only conditional on 23 paired trials / 46 arms and 814 reported non-completions; not all 7,920 starts | Reason-only input must be NONCOMPLETED, or include a completion branch so mass is conserved. Original-label differences, missing breakdowns and unproven exclusivity undermine pooled interpretation. No silent invented “Other” or causal taxonomy | **Do not recommend an aggregate reason Sankey.** Trial-specific optional original-label disclosure only after review |
| A3: trial → registered arm → completed/not completed | Strongest current flow: 38 pairs / 76 arms / 7,920 starts; selected single trial or limited selected set by default | Arm node IDs remain NCT+group. Terminal status nodes remain NCT+group+status for traceability. Node inflow equals outgoing count. Trial/arm partition is an accounting diagram, not an observed temporal path or proof everyone STARTED was randomized | **Recommend.** Directly links the map's rates to counts and arm asymmetry; preserve trial identity rather than merge away heterogeneity |

A3 can show all 38 in a scrollable overview, but 76 arms and 152 potential status leaves would be crowded. Prefer one selected trial, with a deliberate small comparison set (e.g. up to four; a UI legibility limit, not analytical exclusion). No arbitrary top-gap subset as the only view. Link width = STARTED or completion count; show explicit denominators because width alone favors large studies. Distinguish 0 counts from missing values. For 82-mode, nonpaired trials can show original arm types without inventing an experimental/control pair. Do not claim a tiny one-trial split alone clears the complexity bar; the multi-trial, trial-preserving linked flow is more substantial, and parallel coordinates carries the primary complex requirement.

## 4. Hierarchy feasibility

The proposed `intervention → phase → trial` has complete labels in 82/82 and 38/38. Full intervention combinations give seven categories in 82 and six in 38; phase gives four and three categories respectively. With root this is four displayed levels, but only **two independent categorical partitions** before the trial leaf. Phase is not a natural child of intervention type: choosing this order is a navigational faceting convention, not an intrinsic ontology. Multi-component interventions and combined phases cannot be split into multiple leaves without duplicated membership.

A more natural containment hierarchy is **cohort → trial → arm → completion status** (four levels including root; complete for all 82 usable). Each arm belongs to exactly one trial; completion partitions its STARTED count. This is sound containment but essentially the same accounting task as A3, for which flow widths and connections are more intuitive.

| Idiom | Feasibility and visual meaning | Verdict |
|---|---|---|
| Zoomable circle packing | Natural trial→arm nesting valid; circle area can represent STARTED, but enclosing circle geometry includes gaps and makes totals/comparisons less exact | Distinct but weaker attrition reading than Sankey; not preferred |
| Sunburst | Sector angle/area can encode disjoint STARTED partitions across trial/arm/status; deep labels and very small arms difficult | Valid with containment; not a treatment taxonomy; demote |
| Treemap | Trial area = STARTED, within-trial areas = arms; sequential color = attrition at trial or arm level, with clear level semantics | Useful alternative for “which trials account for more participant loss?” but small-trial visibility and color precision poor |
| Hierarchical tree | Nodes and edges encode actual trial/arm containment, counts as labels; no obligation to force area | Most honest hierarchy, less efficient for comparing rate differences; secondary alternative |

Enrollment is complete in 82 and can size **trial-only leaves** if explicitly labeled registry enrollment; it cannot parent STARTED completion partitions because sums differ in 11 trials. Use STARTED for a count-conserving hierarchy. Absolute gap exists in only 38/82, so use selected-trial annotation or a separate paired-only color mode; never encode missing gaps as zero. Do not simultaneously assign color to attrition and asymmetry. Hierarchy can answer where trial participations are concentrated, but a type/phase nesting alone adds little to the central attrition question. No arbitrary hierarchy solely for rubric compliance.

## 5. Multidimensional explorer

Every count below is available/missing within the stated population. Each polyline represents one trial, not an arm or participant.

| Dimension | 82 trials | 38 pairs | Type; axis suitability and qualification |
|---|---:|---:|---|
| Overall attrition | 82/0 | 38/0 | Continuous ratio, 0–100%; strong core axis |
| Absolute gap | 38/44 | 38/0 | Continuous pp; paired mode only; missing is not 0 |
| Signed gap | 38/44 | 38/0 | Diverging pp; toggle replacing absolute gap, not simultaneous redundant axes |
| Enrollment | 82/0 | 38/0 | Count; optional log2 scale clearly labeled, distinct from STARTED |
| STARTED | 82/0 | 38/0 | Count; preferred size/exposure-context axis, not “number randomized” |
| Completion year | 80/2 | 37/1 | Temporal year; missing gutter/broken segment or explicit complete-case n; no imputation |
| Phase | 82/0 | 38/0 | Categorical combinations (4/3 levels); do not assign pseudo-continuous trial stage |
| Sponsor class | 82/0 | 38/0 | Nominal (4/2); axis order arbitrary, use discrete bands or external filter |
| Intervention type set | 82/0 | 38/0 | Nominal (7/6); dominated by DRUG, includes comparator; best as filter/details |
| Calendar span | 39/43 | 19/19 | Continuous days, exact dates only; study calendar time, not follow-up; omit default |
| Protocol arm count | 82/0 | 38/0 | Discrete 2–6 in 82; constant 2 in pairs, omit paired axis |
| Masking | 82/0 | 38/0 | Categorical 5/4 levels; labels describe roles masked, not a continuous quality score |
| Listed site count | 79/3 | 37/1 | Count of location entries, not verified active sites; optional, not default |
| Reporting: reasons present | 82/0 | 38/0 | Boolean indicator; true 55/82, 23/38; no generic completeness percentage |
| Other existing reporting flags | 82/0 | 38/0 | All seven matrix flags except reasons are constant true in these subsets; no informative axes |
| Number randomized | 0/82 | 0/38 | Not derived; prohibited axis |
| Treatment effect | 0/82 usable harmonized effects | 0/38 usable harmonized effects | Numeric outcome availability does not create a comparable effect |

Proposed default 38-pair mode: **STARTED (labeled log2), overall attrition %, absolute gap pp, completion year, phase**. First three are continuous, year temporal, phase categorical. Keep the one missing year as an explicit missing segment/gutter and show 37/38 year coverage; all 38 remain selectable. Sponsor and registered type set are filters, not falsely ordered numeric scores. No missingness problem for the first three axes. Phase labels retain PHASE1/PHASE2 combinations. Optional signed-gap toggle exposes direction.

An 82-trial mode removes the gap axis and adds arm count; it restores the broader landscape rather than requiring rates for excluded records. Population switching must visibly update counts and never manufacture missing pair gaps. Brushing on multiple numeric axes forms an AND selection, updates the map and selected-set flow, and reports retained N. Maintain one persistent selected trial separately from the brushed set. Use keyboard-accessible min/max alternatives to drag brushing. Optional axis reordering is useful but lower priority than correct brushing, reset, labels and tooltips.

This is a genuinely **multidimensional representation**: linked polylines across at least four informative dimensions, axis-specific scales, multiple-axis queries and coordinated selection. It is the clearest match to the listed complex category. Crossing patterns do not imply causation; adjacent-axis slopes depend on units/order. Rates and absolute gap are mathematically related through underlying counts, so apparent patterns are not independent evidence. Do not turn it into a prediction view or add computed clusters solely for sophistication.

## 6. Geography

These counts were read from raw `protocolSection.contactsLocationsModule.locations`, not inferred from sponsor addresses:

| Geographic availability | 201 eligible | 82 usable | 38 paired |
|---|---:|---:|---:|
| Any locations / any country | 192 | 79 | 37 |
| Any nonempty facility name | 171 | 67 | 35 |
| One reported country | 114 | 59 | 30 |
| Multiple reported countries | 78 | 20 | 7 |
| Any geoPoint | 190 | 78 | 37 |
| Location entries | 7,002 | 1,898 | 732 |
| Entries with geoPoint | 6,733 | 1,786 | 706 |
| Distinct reported countries | 51 | 41 | 27 |

GeoPoint counts mean coordinate objects exist, not an independent geographic accuracy audit. Most locations would not need geocoding; 269/7,002 entries lack geoPoint. Do not geocode missing facilities just to make a map. No location-to-participant-flow count linkage is represented in the current verified tables; raw flow groups describe arms/periods, not standardized country/site STARTED and COMPLETED totals. We have **trial-level/arm-level attrition, no validated site-level attrition**.

A map of participating facilities could answer geographic coverage of this registry cohort. It is peripheral to the attrition question. Assigning a multinational trial's rate to every country/site would duplicate trial evidence, imply local outcomes and invite ecological error. A choropleth of “country attrition” or weighted country rates without country denominators is **actively misleading**. A trial-presence map with deduplicated trial membership is technically possible but mainly contextual here. Recommendation: geography in trial metadata only, not one of the five or the complex-view solution.

## 7. Other candidates

- **Coordinated attribute/reporting matrix:** rows = 201 trials; columns = existing source-presence and rule-pass flags, plus carefully labeled categorical metadata. Edges are not needed; cells encode observed availability or eligibility. Column filters, group-by sponsor/phase, linked row selection and visible sample counts could answer where extraction exclusions concentrate. Very relevant and low-risk. The present seven-Boolean matrix alone should not be sold as clearly complex; a richer matrix remains a useful complementary view, not the sole rubric bet. Do not add algorithmic clustering without a justified distance.
- **Trial–intervention bipartite graph:** trial nodes and exact registered intervention-name nodes, edges mean “listed in this trial,” not randomized assignment, shared efficacy or similarity. Among 38 pairs: 54 distinct exact names and 88 trial/name edges. Names include placebo/co-interventions; doses/synonyms split nodes. A hub for placebo would largely reflect reporting conventions. Valid incidence graph, weak attrition story; no unsupported mechanism taxonomy or inferred similarity edge.
- **Outcome-measure graph/matrix:** 330 outcomes, 306 exact titles, 117 title-screened MADRS outcomes and 44 HAM-D/HDRS. Exact-title network highly fragmented; scale-title grouping is only a text screen. Edges must mean shared recorded labels, not comparable treatment effects. Could explain outcome heterogeneity but distracts from attrition and does not solve harmonization.
- **Reason text view:** original labels are available, but a word cloud conflates label wording/occurrence with participant count, and “not” or combined reasons can reverse meaning. An original-label concordance table linked to trials is useful audit detail; not a causal “why” story or preferred primary complex view.
- **Nonlinear temporal flow:** 51 multi-period studies lack approved cross-period links; no individual paths or common follow-up schedule. Not presently defensible. Study dates are not participant event times.

## 8. Current active visualization audit

Only active `/final/`, not archived versions, counts here.

| Current view | Idiom / population / question | Current interaction | Count toward five? Distinctness / complexity / action |
|---|---|---|---|
| Attrition Map | 2D scatter; 38; how much and how uneven? | Hover, persistent click/keyboard selection, shared highlight/search | Yes; distinct bivariate relation; basic; keep hero |
| Overall distribution | Collision-stacked dot distribution; 82; where does a trial lie? | Hover/select, linked highlight | Yes candidate; differs from bivariate map; basic; retain compact context |
| Absolute-gap distribution | Same distribution idiom; 38; how large is gap? | Hover/select, linked highlight | Do not count separately to establish idiom diversity; basic; demote/redundant with map and dumbbell |
| Selected-trial completion bars | Per-arm normalized stacked bars; usable selected trial (pair default) | Updated by selection elsewhere, metadata disclosure | Supporting details rather than independent quota filler; basic; replace/augment with A3 |
| Evidence progression | Four count bars; 201→82→38→14 | Passive selected-membership ticks | Not an independently interactive primary view; basic; keep compact |
| All-pair comparison | Connected dots/dumbbell; 38; direction and magnitude by trial | Signed/absolute/ID sorting, hover/select/link | Yes; explicit paired comparison; intermediate; keep secondary |
| Coefficient view | Point/interval plot; model n=82 or 81, three coefficients | Sensitivity switch, native title inspection | Plausible fifth count, but weak distinctness versus other point-line encodings and no trial-level linking; intermediate; demote |
| Subgroup distributions | Grouped collision swarms; 82 plus eligible denominators | Phase/sponsor grouping switch, hover/select | Extension of distribution rather than extra idiom; intermediate; demote into explorer |
| Reporting matrix | Binary status matrix; 201, filtered 82 or 119 | Eligibility filter, year/ID sort, hover/select/link | Yes; distinct categorical matrix; intermediate, not clearly complex; keep/improve |
| Original reason/outcome tables | Structured record text/cells for selection | Count/share switch for reasons; disclosures | Useful details, not additional graphical idioms; keep as details |

The five strongest current candidates are map, overall distribution, dumbbell, coefficient plot and matrix. That makes a numerical “five” reasonable, **not a secure complete rubric pass**. The redesign should not claim two identical swarms, a passive bar or a disclosure as the missing distinct visualization. The professor's complex-view objection is valid under this conservative audit. None currently clearly exceeds intermediate representation complexity.

## 9. Current interaction audit

Count interaction families, not repeated appearances:

1. Persistent trial selection with coordinated updates/highlighting across map, swarms, dumbbell, subgroups and matrix. One family, not a separate quota item per view.
2. Search by NCT/title/intervention across 201; selects records, does **not** globally filter charts.
3. Sorting paired trials by signed/absolute gap or ID, and reporting rows by year/ID. One sorting family.
4. Filtering reporting rows by usable/review/all. Local filter only; not a global cohort filter.
5. Changing subgroup dimension between phase and sponsor.
6. Switching model specification (82 versus 81 anomaly sensitivity).
7. Switching reported reason counts versus valid shares.
8. Details on demand: temporary tooltips and expandable metadata/source records. Treat repeated tooltips as one family.

**Yes, at least five meaningful interaction families exist.** Reset clears selection/search and restores pair ordering, but does not reset every secondary control; do not describe it as a universal reset. Brushing, axis reordering and coordinated subset filtering do **not** currently exist. Future brushing should connect the complex view, map, dumbbell and selected-set flow, while the 201-trial matrix preserves broader availability context. Clicking a matrix-only unusable trial must show “no validated attrition” elsewhere, not hide the reason it failed.

## 10. Explicit candidate ranking

Scores are design judgments grounded in the counts above, not measured user-test results. All 1–5 scales have higher = better. Coverage = coverage of intended question/population; validity = few unsupported assumptions; complexity = strength as a meaningful complex representation (not developer effort); feasibility = easier implementation before the recorded deadline; **safety = lower risk of misleading interpretation**. Equal-weight total out of 50 is a discussion aid; low validity cannot be compensated by visual novelty.

| Candidate | Coverage | Validity | Relevance | Intuitive | Distinct | Interaction | Complexity | Story | Safety | Feasible | /50 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Parallel coordinates, 38/82 modes | 5 | 5 | 5 | 3 | 5 | 5 | 5 | 5 | 4 | 4 | 46 |
| A3 trial-preserving Sankey | 5 | 4 | 5 | 5 | 5 | 4 | 4 | 5 | 4 | 4 | 45 |
| Coordinated attribute/reporting matrix | 5 | 5 | 4 | 4 | 4 | 5 | 3 | 4 | 5 | 5 | 44 |
| Natural trial→arm hierarchy | 5 | 4 | 3 | 3 | 5 | 4 | 4 | 3 | 3 | 4 | 38 |
| A1 type-set→role→status Sankey | 5 | 3 | 4 | 4 | 5 | 4 | 4 | 3 | 2 | 4 | 38 |
| Trial–intervention bipartite graph | 4 | 3 | 2 | 2 | 5 | 4 | 4 | 2 | 2 | 3 | 31 |
| A2 pooled withdrawal-reason Sankey | 3 | 2 | 4 | 2 | 5 | 4 | 4 | 3 | 1 | 2 | 30 |
| Geographic attrition map | 4 | 2 | 1 | 4 | 5 | 3 | 4 | 1 | 1 | 3 | 28 |

Hierarchy score refers to actual containment, not arbitrary intervention/phase nesting. Geographic score penalizes absent geographic denominators; a presence-only map would be more valid but still tangential. A3 and parallel coordinates complement each other: absolute counts versus multidimensional trial attributes. Do not choose the network simply because it looks technically sophisticated.

## 11. Exactly five recommended primary visualizations

### 1 — Attrition Map (HERO)
- **Question:** How much non-completion occurs, and how unevenly between randomized arms?
- **Population:** Existing 38 reliable pairs, subset-highlighted by explorer; keep full-cohort context visible.
- **Idiom/encoding:** Point per NCT. X = absolute gap pp; Y = overall attrition %. Fixed-size points avoid a new third size encoding. Rust = selected; muted = outside active brush. Existing median reference explicitly descriptive.
- **Interaction:** Hover and persistent selection; search; coordinated subset highlighting.
- **Linkage:** Selects same trial in all views. Nonpaired selections show absence explicitly.
- **Why:** Immediate two-question overview; mathematical dependence acknowledged, no causal claim.

### 2 — Trial characteristics explorer (PRIMARY COMPLEX VIEW)
- **Question:** Which combinations of trial characteristics accompany regions of the attrition landscape?
- **Population:** Default 38; explicit 82 mode with no invented gap axis.
- **Idiom/encoding:** Parallel coordinates; one polyline/NCT. Axis positions encode their separately labeled values. STARTED log2, overall rate, absolute/signed gap toggle, year and categorical phase in paired mode; 82 mode drops gap and adds arm count. Nominal filters for sponsor/type set. Missing-year segment is broken/gutter-labeled, never assigned a numeric coordinate.
- **Interaction:** Multiple-axis brushing with accessible numeric inputs, sponsor/type filters, selection, reset; optional reorder after essentials.
- **Linkage:** Brush defines a trial ID set; highlight it on hero/dumbbell/matrix, update explicit subset counts. Persistent selection is separate from brush membership.
- **Why:** Clearly different multidimensional idiom, answers combinations rather than more marginal distributions; strongest complex-representation fit.

### 3 — Where the counts go (SECOND COMPLEX CANDIDATE)
- **Question:** What completed/not-completed counts produce the selected trial's arm rates?
- **Population:** Selected reliable pair or explicitly selected small set from 38; optional valid 82-mode trials retain original arms/types.
- **Idiom/encoding:** Sankey with trial→NCT-specific arm→NCT/arm-specific status. Ribbon width encodes registered-period participant count; slate completed and rust not completed, with separate outline/focus marker for selection. No merged role hub that erases trial paths. Node totals conserved. Exact text denominators accompany widths.
- **Interaction:** Select trial/arm ribbon for detail; compare a small selected set; toggle displayed count/rate labels, without changing width semantics. Optional reviewed reason drilldown retains original labels only, not default aggregate reasons.
- **Linkage:** Map and explorer selection update flow; selecting a ribbon selects its NCT everywhere.
- **Why:** Reveals denominators and actual arm composition; distinguishes trial-weighted rates from participant totals. No claim of individual longitudinal tracking.

### 4 — Arm-to-arm comparison
- **Question:** Which arm has higher attrition, and by how much within each trial?
- **Population:** 38 with visible brush membership/counts.
- **Idiom/encoding:** Existing dumbbell: endpoint position = arm attrition on common 0–100% scale; shape identifies experimental/comparator; signed pp text shows direction; connection joins arms of one trial. Color/outline selected consistently without obscuring role.
- **Interaction:** Signed/absolute sorting, row selection, hover counts, option to show only brushed set.
- **Linkage:** Shared selected trial and brushed set, no new pairing rules.
- **Why:** Map uses absolute differences; this view restores direction and both underlying rates. Detailed comparison belongs below the hero, not another equally dominant section.

### 5 — Evidence availability and analytical eligibility
- **Question:** How far does reporting and our extraction support the next question, and what excludes individual trials?
- **Population:** All 201; show 82/38/14 memberships, not only selected usable data.
- **Idiom/encoding:** Matrix rows=NCT; source flags as filled/open circles, extraction rules as squares/review triangles. Preserve this semantic distinction. Group/sort by registered sponsor/phase/year; explicit cohort membership marks. Compact 201→82→38→14 counts remain adjunct labels, not inferred effects.
- **Interaction:** Source/rule filtering, row selection, sorting/grouping, tooltip exact failure flags; brush membership highlighting.
- **Linkage:** Selecting an unusable trial explains missing plots instead of implying zero attrition. The selected cohort never replaces the all-eligible denominator silently.
- **Why:** Directly communicates limits, avoids pretending that results availability means comparable outcomes, gives the system an honest endpoint.

## 12. Single-page architecture and story

```text
+---------------------------------------------------------------------+
| How many leave? How unevenly?                                        |
| Search | Population: paired 38 / usable 82 | subset N | Clear filters |
+------------------------------------------+--------------------------+
| 1. HERO ATTRITION MAP                     | 3. PARTICIPANT FLOW       |
| 38 paired trials; fixed scientific axes   | selected trial / set      |
|                                          | trial → arm → status      |
|                                          | selected metadata/counts  |
+------------------------------------------+--------------------------+
| 2. COMPLEX PARALLEL-COORDINATES EXPLORER                               |
| compact wide band; axis brushes; signed/absolute gap; category filters |
+------------------------------------------+--------------------------+
| 4. PAIRED COMPARISON                      | 5. EVIDENCE MATRIX        |
| ranked detail; bounded scroll/expand      | 201-trial context         |
| signed / absolute sort                   | source ≠ eligibility      |
+------------------------------------------+--------------------------+
| Methods / limitations / original reasons & outcomes [expand]         |
+---------------------------------------------------------------------+
```

Two dominant views are map and linked flow, with the multi-axis explorer sufficiently wide to read labels/brushes; do not squeeze parallel coordinates into a narrow sidebar. Lower views are compact previews with expansion, not five full-screen essays. Selected-trial metadata sits with flow and is not counted separately. On mobile: hero, flow/inspector, explorer with readable horizontal scrolling plus accessible filters, then comparison and matrix. Explain cohort switches visibly: the hero remains 38-pair context when exploring 82, with unavailable pair relationships explicit.

Story: **scale and asymmetry → trial-characteristic combinations → counts behind the rates → direction of paired differences → limits of usable evidence**. Readers can move between these tasks in one coordinated system. The 82-mode explorer and optional compact overall distribution establish broader variation beyond pairs. The reporting matrix makes selection restrictions visible; 14 outcome candidates end with an unresolved comparability statement, not an effect estimate. Regression stays optional supporting methodology, not a primary story act.

## 13. Risks, acceptance gates and next implementation

1. Preserve all current data definitions and hashes. A chart-only feasibility audit is not permission to change cohort rules.
2. Build a small read-only derived view model later from existing `final/data.json`: unique NCT/group keys, count conservation, no duplicate trial/category membership. Count participations, not unique humans.
3. Implement the **parallel-coordinates explorer first**, with 38 trials, three complete core numerical axes, explicit year missingness and phase semantics; test brush ID sets against hand-picked records. This is the highest-value direct response to the complex-view feedback. Show its design to the professor; do not claim approval already received.
4. Then implement A3 using the same trial state; test 7,920 = 6,721 + 1,199 and each arm's conservation. Inspect NCT04019704, NCT02176291 and NCT03433339 against existing records. Add multi-trial comparison only after single-trial correctness. Do not add pooled reasons.
5. Maintain selection versus filtered-set state separately. Missing pair gaps cannot become zero; resets clear all new filters; fixed reference statistics must remain explicitly full-cohort or be recomputed with visible N (future implementation choice, not changed here).
6. Avoid unsupported standardized duration, ordinal sponsor scores, causal reasons, global treatment-effect inference and geographical rate attribution. Raw site data need no new acquisition for an inventory, but cannot create site outcomes.
7. Test human comprehension: interpret an axis brush; explain a large gap with low overall rate; read which arm has higher attrition; recover counts from flow; distinguish source presence from extraction eligibility. Record task accuracy/confusions rather than just aesthetics.
8. Existing analytical pipeline and site remain untouched. No new statistical model, acquisition, runtime dependency, staging, commit or push is part of this audit. Stop here pending the user's decision.

## Appendix — Reproducible read-only count audit

Run the following Python from the repository root to print source/payload availability, flow totals, categories, geographic coverage and reason reconciliation. It reads only files; it does not invoke pipeline writers or change stored metrics. Output label frequencies count table entries (not participant frequency), and coordinate-object presence is not accuracy validation. Additional displayed checks used enrollment-versus-STARTED comparisons, exact-name trial/intervention sets and SHA-256 comparisons to the existing baselines.

```python
import json,collections,csv,pathlib
P=pathlib.Path('.')
d=json.loads((P/'final/data.json').read_text());ts=d['trials'];raw={}
for p in (P/'data/raw/2026-09-13').glob('page_*.json'):
 for s in json.loads(p.read_text())['studies']:raw[s['protocolSection']['identificationModule']['nctId']]=s
out={}
for name,co in [('eligible',ts),('usable',[t for t in ts if t['usable']]),('paired',[t for t in ts if t['pair']])]:
 x={'n':len(co),'fields':{},'categories':{},'geo':{},'reasons':{}}
 for k in ['attrition','enrollment','started','completed','completion_year','phase','sponsor_class','intervention_types','calendar_span_days','protocol_arm_count','site_count','masking']:
  v=[t[k] for t in co if t[k] is not None and t[k]!=''];x['fields'][k]=len(v)
 for k in ['phase','sponsor_class','intervention_types','protocol_arm_count','masking','period_count']:
  x['categories'][k]=dict(collections.Counter(str(t[k]) for t in co))
 x['reporting']={k:sum(t['reporting'][k] for t in co) for k in co[0]['reporting'] if isinstance(co[0]['reporting'][k],bool)}
 locs=[raw[t['nct_id']]['protocolSection'].get('contactsLocationsModule',{}).get('locations',[]) for t in co]
 x['geo']={'locations_trials':sum(bool(l) for l in locs),'facility_trials':sum(any(z.get('facility') for z in l) for l in locs),'country_trials':sum(any(z.get('country') for z in l) for l in locs),'single_country':sum(len({z['country'] for z in l if z.get('country')})==1 for l in locs),'multinational':sum(len({z['country'] for z in l if z.get('country')})>1 for l in locs),'geoPoint_trials':sum(any('geoPoint' in z for z in l) for l in locs),'location_entries':sum(map(len,locs)),'coordinate_entries':sum('geoPoint' in z for l in locs for z in l),'countries':len({z['country'] for l in locs for z in l if z.get('country')})}
 arms=[a for t in co for a in t['arms']];rec=[a for a in arms if a['reason_reconciles'] is True];x['reasons']={'arms':len(arms),'reconciled_arms':len(rec),'reconciled_positive_arms':sum(a['noncompleted']>0 for a in rec),'trials_any_reconciled':sum(any(a['reason_reconciles'] is True for a in t['arms']) for t in co),'trials_all_reconciled':sum(bool(t['arms']) and all(a['reason_reconciles'] is True for a in t['arms']) for t in co),'trials_all_reconciled_positive':sum(bool(t['arms']) and all(a['reason_reconciles'] is True for a in t['arms']) and sum(a['noncompleted'] for a in t['arms'])>0 for t in co),'reason_entries':sum(len(t['reasons']) for t in co),'original_labels':len({r['reason_label'] for t in co for r in t['reasons']}),'labels':dict(collections.Counter(r['reason_label'] for t in co for r in t['reasons']))}
 if name!='eligible':
  x['counts']={k:sum(t[k] for t in co) for k in ['started','completed','enrollment']}
  x['reconciled_noncompletion']=sum(a['noncompleted'] for a in rec)
  x['arm_types']=dict(collections.Counter(a['arm_type'] for a in arms))
  x['both_reason_trials']=[t['nct_id'] for t in co if all(a['reason_reconciles'] is True for a in t['arms'])]
 out[name]=x
# Source milestone presence independently of valid attrition/mapping. All groups/periods must have one nonnegative integer numSubjects, no numUnits.
def ok(s,typ):
 f=s.get('resultsSection',{}).get('participantFlowModule',{});gs=f.get('groups',[]);ps=f.get('periods',[])
 if not gs or not ps:return False
 for p in ps:
  for g in gs:
   a=[a for m in p.get('milestones',[]) if m.get('type')==typ for a in m.get('achievements',[]) if a.get('groupId')==g['id']]
   if len(a)!=1 or 'numUnits' in a[0]:return False
   v=a[0].get('numSubjects');
   if not str(v).isdigit():return False
 return True
out['raw_milestones']={k:sum(ok(raw[t['nct_id']],k) for t in ts) for k in ['STARTED','COMPLETED']}
out['raw_milestones']['both']=sum(ok(raw[t['nct_id']],'STARTED') and ok(raw[t['nct_id']],'COMPLETED') for t in ts)
out['paired_roles']={role:{k:sum(t['pair'][role+'_'+k] for t in ts if t['pair']) for k in ['started','completed']} for role in ['experimental','comparator']}
out['paired_comparator_types']=dict(collections.Counter(t['pair']['comparator_type'] for t in ts if t['pair']))
print(json.dumps(out,indent=2))

```
