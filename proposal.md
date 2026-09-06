# Who Leaves Clinical Trials? Visualizing Participant Attrition in Randomized Depression Studies

**Group members:** Alicia Lu and Vera Piao

## 1. Topic, Goals, and Questions

Randomization makes treatment groups comparable at baseline, but participants may subsequently discontinue treatment, withdraw consent, experience adverse events, or become lost to follow-up. When attrition is substantial or differs between arms, those who remain may not represent those originally randomized, complicating treatment-effect interpretation. Attrition is therefore an important missing-data problem in biostatistics.

Our project will visualize participant attrition in completed randomized Phase II/III major-depression trials. We will focus on parallel-group trials with structured results. Our audience includes clinical researchers, biostatistics students, and readers evaluating participant retention and reporting.

We will investigate:

1. How much do overall attrition rates vary among eligible depression trials?
2. Does attrition differ between intervention and comparator arms within the same trial?
3. Which reasons—such as adverse events, lack of efficacy, participant withdrawal, and loss to follow-up—account for non-completion?
4. How are attrition and reporting completeness associated with trial duration, phase, masking, sponsor type, and intervention type?
5. Has participant-flow reporting changed over calendar time?

We will describe associations, not claim that trial characteristics cause attrition or that attrition necessarily biases treatment effects.

## 2. Datasets

Our source will be the National Library of Medicine's [ClinicalTrials.gov REST API](https://clinicaltrials.gov/data-api/api). Its [data documentation](https://clinicaltrials.gov/data-api/about-api/study-data-structure) defines study arms, participant-flow periods and milestones, and arm-specific reasons for non-completion.

Python will retrieve records through paginated requests. Queries will target completed, randomized, interventional Phase II/III depression studies with results. Timestamped JSON will be preserved. We anticipate 200–800 candidates, subject to a pilot query; design and quality criteria will reduce the final cohort. We expect 25–35 trial-level variables, multiple arm records per trial, and several reason records per arm.

Nested JSON will become three linked tables: trial (one row per NCT identifier), arm (one per trial arm), and attrition reason (one per arm, period, and reason). Key attributes include phase, sponsor, masking, intervention model, enrollment, dates, intervention, period, started/completed counts, withdrawal reason, and reason-specific count.

Within an identified treatment period, attrition is \(1-C/S\), where \(S\) starts and \(C\) completes the period; protocol enrollment will not substitute for \(S\). Raw withdrawal labels will be retained and reproducibly grouped. Crossover designs, non-participant units, ambiguous periods, and unusable milestones will be flagged or excluded. We will test whether reason counts reconcile with \(S-C\) and manually validate a sample.

## 3. Analysis and Visualization Methods

Python (`requests`, `pandas`) will support acquisition, cleaning, validation, and analysis; the site will use HTML/CSS, JavaScript, and D3.js. We will summarize distributions, conduct paired arm comparisons, and explore associations through stratification and, if feasible, binomial regression.

Five coordinated views will support overview, comparison, filtering, relationship discovery, and outlier detection. Selecting a trial or filtering by year, sponsor, phase, or intervention will update other views, connecting population patterns to individual records.

## 4. Initial Visualization Sketches

**1. Trial landscape — bubble scatterplot**

```text
Attrition  |       O     o
rate       |  o  o    O       size = participants
           |____o____________
                 Trial duration
```

This view identifies relationships between duration and attrition and reveals unusually high-attrition trials.

**2. Arm imbalance — diverging dot plot**

```text
Comparator higher <---- 0 ----> Intervention higher
Trial A          o       |          Trial B o
```

This view compares intervention and comparator attrition within each trial and highlights differential attrition.

**3. Reasons for non-completion — normalized stacked bars**

```text
Trial A | adverse event | withdrawal | lost | other |
Trial B | AE |      withdrawal       | lost | other |
```

This view shows whether trials with similar total attrition have different patterns of participant departure.

**4. Selected-trial flow — Sankey diagram**

```text
Started ---- Completed
        |--- Adverse event
        |--- Lack of efficacy
        |--- Lost/withdrew
```

This view explains how aggregate participants in a selected trial flow from treatment start to completion or reported exit reasons.

**5. Reporting completeness — missingness heatmap**

```text
          Started Completed Reasons Period Arm link
Trial A      ■       ■        ■      ■      ■
Trial B      ■       □        □      ■      ■
```

This view reveals which participant-flow elements are missing or inconsistent and whether deficiencies cluster by trial type or year.

## 5. Group Roles and Responsibilities

- **Alicia Lu:** lead API acquisition, raw-data archiving, JSON parsing, linked-table construction, derived attrition measures, and statistical analysis. She will implement the trial-landscape and reporting-completeness views.
- **Vera Piao:** lead withdrawal-reason taxonomy, record validation, visual and interaction design, and D3 state management. She will implement the arm-imbalance, reason-composition, and Sankey views and coordinate documentation.
- **Both members:** review code and classifications, integrate linked filtering, test accessibility, deploy the dashboard, interpret findings, and prepare and deliver the presentation.

## 6. Interim Presentation Deliverables

For the interim presentation, we will demonstrate the API pipeline, cleaned linked tables, cohort inclusion counts, preliminary attrition distributions, and data-quality issues. We will show linked prototypes of the landscape, arm-imbalance, and trial-flow views, plus refined questions and plans for the remaining interactions.

## 7. Timeline and Milestones

| Week | Milestone | Tasks | Responsible member(s) | Expected output |
|---|---|---|---|---|
| 2 | Project definition | Finalize cohort, variables, questions, and API query | Alicia and Vera | Protocol and data dictionary |
| 3 | Data acquisition | Implement pagination, archive JSON, flatten records, review extraction | Alicia leads pipeline; Vera validates records | Reproducible pipeline and preliminary tables |
| 4 | Data preparation | Select periods, normalize reasons, validate records, conduct EDA | Alicia leads measures/EDA; Vera leads taxonomy/validation | Analysis-ready data and QA report |
| 5 | Interim prototype | Build and link landscape, imbalance, and reason views | Alicia builds landscape; Vera builds two comparison views | Working D3 prototype and interim presentation |
| 6 | Implementation and refinement | Add Sankey, heatmap, filters, analysis, accessibility, and tests | Alicia builds heatmap/analysis; Vera builds Sankey/interactions; both test | Integrated beta dashboard |
| 7 | Final integration | Test, deploy, and finalize narrative, documentation, and presentation | Alicia and Vera | Final website, repository, and presentation |
