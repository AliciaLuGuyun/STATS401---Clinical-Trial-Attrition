# Project Proposal Summary

Status: recovered proposal; respiratory scope NOT verified. Source: `proposal.md`, read completely on 2026-09-12. Original preserved.

## Topic
Who Leaves Clinical Trials? Visualizing Participant Attrition in Randomized Depression Studies.

## Main Research Question
The proposal lists five questions without explicitly ranking one as primary. Its first question is: “How much do overall attrition rates vary among eligible depression trials?”

## Secondary Questions
Within-trial intervention/comparator differences; reasons for non-completion; associations with duration, phase, masking, sponsor and intervention type; changes in participant-flow reporting over time.

## Motivation
Attrition can undermine baseline comparability and complicate treatment-effect interpretation. The work describes associations, without causal or automatic bias claims.

## Dataset
Planned ClinicalTrials.gov REST API acquisition of completed randomized interventional Phase II/III major-depression trials, parallel-group with structured results. Anticipated 200–800 candidates and 25–35 trial variables are estimates, not observed counts. Timestamped JSON and three linked tables are proposed. No project dataset or extraction pipeline was located in the inspected workspace.

## Unit of Observation
Trial: NCT identifier. Arm: trial arm. Reason: arm, period and reported reason. These are aggregate records, not individual participant records.

## Important Variables
Phase, sponsor, masking, intervention model, enrollment, dates, intervention, treatment period, started/completed counts, withdrawal labels and reason counts. Attrition = 1 − completed/started in the selected period; enrollment must not substitute for started.

## Intended Audience
Clinical researchers, biostatistics students, and readers evaluating retention and reporting.

## Analytical Goals
Describe distributions, paired arm differences and stratified associations; binomial regression is optional and feasibility-dependent.

## Visualization Goals
Connect population patterns to selected records; support comparison, filtering, relationship discovery, outlier detection and reporting-quality inspection.

## Proposed Visualizations
1. Bubble scatterplot: duration versus attrition, participant count as size.
2. Diverging dot plot: intervention-minus-comparator attrition.
3. Normalized stacked bars: composition of reported non-completion reasons.
4. Selected-trial Sankey: treatment starts to completion/exit reasons.
5. Missingness heatmap: participant-flow completeness and consistency.

## Proposed Interaction
Coordinated selection and filters for year, sponsor, phase and intervention. Five distinct meaningful interactions are not yet specified.

## Intended Story
Reveal variation hidden across registry records, compare arms, inspect departure reasons and place findings in the context of reporting quality. Final narrative must follow actual data.

## Known Limitations
Ambiguous periods, crossover designs, non-participant units and unusable milestones require flags/exclusions. Preserve raw reason labels, reconcile reasons against started-minus-completed, and manually validate records. No causal inference is promised.

## Team and Milestones
Alicia Lu leads acquisition, parsing, measures, analysis, landscape and heatmap. Vera Piao leads taxonomy, validation, design, D3 state, imbalance, reasons and Sankey. Both integrate, review, test accessibility, deploy and present. Seven-week proposal timeline is not an official deadline schedule.

## Open Questions
- User describes respiratory disease; both recovered proposals explicitly specify depression. User resolution is required before cohort decisions.
- Confirm the intended local checkout of `AliciaLuGuyun/STATS401---Clinical-Trial-Attrition`; none found in the bounded search.
- `.publish-lab4/proposal.md` has three placeholder members; root proposal names Alicia and Vera. Do not silently reconcile versions.
- Interim prose proposes landscape/imbalance/flow prototypes; week-5 table proposes landscape/imbalance/reasons. Resolve before milestone implementation.
- Define duration, calendar-year field, period selection, multi-arm pairing, zero denominators, reason overlap and missing/unreported counts before analysis.
- Confirm whether Sankey qualifies for the complex-representation requirement if uncertain; no teaching-team approval located.

## 2026-09-13 clarification (supersedes historical blockers)
User confirms depression-trial attrition is intended; earlier respiratory wording was incorrect. The correct existing GitHub repository has now been cloned here. Remote proposal matches the named two-person proposal. The interim milestone requires three static actual-data figures and written interaction/evaluation plans; linked prototypes, Sankey and slides are deferred per the user’s current instruction.
