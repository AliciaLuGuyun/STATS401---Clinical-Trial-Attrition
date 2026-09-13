# Interim visualization and evaluation specification

All figures answer the original attrition questions using actual processed data. Static Matplotlib is used for this milestone; D3 remains the planned final interactive technology. No invented observations, models or random sampling are used.

| View / question | Data and filtering | Marks and channels | Effectiveness / expressiveness | Limitations and takeaway | Planned interaction / purpose |
|---|---|---|---|---|---|
| Landscape: how much does reported non-completion vary? | All 80 usable trials with completion year; sum counts before rate | Points; year x, rate y, STARTED as area (0.25 pt²/person), one blue hue | Shared position supports comparisons; area encodes magnitude approximately; percent scale 0–100, no trend line | Median 13.1%; heterogeneity and reporting anomaly at 100%; not duration-adjusted | Metadata/count selection, phase/sponsor/year filters and linked highlight connect population pattern to source record |
| Differences: which arm has higher non-completion? | All 38 usable two-arm trials with one explicit experimental and comparator arm; signed difference sorting | Points and reference segments; x percentage-point difference, y NCT ID; hue reinforces sign | Symmetric shared x scale and zero anchor; labels and position make color nonessential | 14 experimental higher, 19 comparator higher, 5 equal; −20 to +25 pp; not an effect-size meta-analysis | Signed/absolute sort, arm counts on selection, linked selection support inspection of imbalance and denominators |
| Reasons: which original labels have largest counts? | Reconciled reasons only, 152 arms / 55 trials; sum exact original labels; ten highest counts, all labels downloadable | Horizontal bars; length/position = count; y original label; uniform hue | Zero baseline, descending order and direct counts; no misleading proportions | Adverse Event 569 leads among individual labels; synonyms unmerged, heterogeneous reporting and size affect ranking | Label-to-trial drilldown, arm/trial filter, count/proportion switch reveal contributors and composition with explicit denominators |

## Layout, annotation and accessibility
Sequence: overall variation → within-trial comparison → reported departures. Display sample/denominator and limitations adjacent to each chart. The landscape annotates the all-zero-completion record; no other outlier subset is highlighted. Differences include all paired trials across two panels sorted left then right. Reasons show the top ten by an explicit rule, with the full ranked table linked. Blue/orange colors are redundant with position/sign; labels and alt text describe the information. SVG keeps text scalable; PNG fallback files are saved. On narrow screens figures can be scrolled horizontally and opened full-size. No animation is needed for the static milestone; future transitions should respect reduced-motion preference.

## Evaluation: what
Evaluate accurate identification of high attrition, difference direction and frequent original labels; understanding of denominators and missing reporting; clarity of encodings/labels; usefulness of future linked filters; coherence of the sequence.

## Evaluation: how
Plan 4–6 classmates in short informal sessions. Do not claim completed evaluation. Static tasks:
1. Locate a high-attrition trial and state whether its reported 100% proves everyone truly dropped out (expected: no; reporting needs scrutiny).
2. Given an NCT ID in plot_pairs.csv, identify which arm has higher attrition and interpret the difference in percentage points.
3. Name the largest original reason label and its count (Adverse Event, 569).
4. Explain why an absent reason table is not evidence of zero withdrawals.
5. Summarize what the three views reveal and one limitation.
After D3 implementation, add a phase-filter and linked-trial selection task. Prepare answer keys from the frozen plot tables, observe attempts without leading the participant, and use brief think-aloud explanations. Allow stopping/skipping any task.

## Evaluation: data/feedback
Anonymous participant code, task success/correctness, approximate time, assistance, points of confusion/interaction errors, 1–5 clarity and usefulness ratings, and open comments. Do not collect medical or identity information. Aggregate results in a small issue list; prioritize recurring incorrect interpretations before cosmetic preferences. No feedback has been collected or invented; this is class-project usability work, not formal human-subjects research.
