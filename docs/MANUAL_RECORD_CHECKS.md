# Manual spot checks — 2026-09-13

These checks read the archived ClinicalTrials.gov participant-flow JSON and the corresponding processed rows directly. They supplement the full automated count audit; they are not clinician validation or a claim to have recontacted study investigators.

| NCT ID | Source / processed checks | Figure implication |
|---|---|---|
| NCT00149643 | Fluoxetine STARTED 34, COMPLETED 0; Placebo 36, 0; source has no reasons. Source explicitly reports NOT COMPLETED 34/36. | Landscape 100% is numerically faithful but a reporting anomaly requiring review; annotation retained, not silently excluded. Not forced into the paired view unless the protocol arm types satisfy the pairing rule. |
| NCT03433339 | Exact protocol labels Active Treatment (EXPERIMENTAL) and Sham Treatment (SHAM_COMPARATOR). Counts 10→8 and 10→6. Original reasons sum 2/4; lost follow-up 2/0, COVID restrictions 0/2, withdrawal 0/2. | Overall 30%; paired 20%−40%=−20 pp; reason labels/counts agree. |
| NCT02176291 | Buprenorphine EXPERIMENTAL 20→15; Placebo PLACEBO_COMPARATOR 11→11. Experimental reasons: Death 1, non compliance with protocol 2, Withdrawal by Subject 2. | Overall 5/31=16.13%; paired +25 pp; all 5 reasons reconcile. |
| NCT04019704 | AXS-05 EXPERIMENTAL 163→123; Placebo PLACEBO_COMPARATOR 164→147. Exact label match; no reason table. | Trial 57/327=17.43%; difference 24.54%−10.37%=14.17 pp; absent reasons do not become zero. |
| NCT01625845 | Pentoxifylline + Standard Treatment 10→5; Placebo + Standard Treatment 6→3. Reasons AE 1/2, lost follow-up 2/1, withdrawal 2/0. | Overall 50%; pair difference 0; source reason sums equal non-completion in both arms. |

Source links can be formed as `https://clinicaltrials.gov/study/NCT_ID?tab=results`. The figures use the archived snapshot rather than any subsequently updated live record. The raw-to-CSV validator additionally checks all 403 arm rows, all 1,896 reason rows and all 38 pair calculations.

Visual inspection: all three PNG figures opened and reviewed; axes, units, zero/full-percent scales, ordered labels and the 100% annotation are readable. The page uses equivalent deterministic SVGs. Public browser verification is tracked separately in INTERIM_AUDIT.md.
