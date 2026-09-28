# Project Log

## 2026-09-12 recovery session (Asia/Shanghai)

Goal: recover existing project, inspect proposal and requirements, preserve existing work.

### Repository findings
- Workspace: /Users/guyunlu/Documents/ChatGPT/STATS401. README identifies STATS401 Labs. Branch main is unborn: no HEAD commit, no remote, all existing files untracked. Ahead/behind is not applicable. Tracked and staged diffs are empty; that does not mean the folder is clean.
- Nested checkout: /Users/guyunlu/Documents/ChatGPT/STATS401/.publish-lab4. Remote https://github.com/AliciaLuGuyun/STATS401.git. Branch main; HEAD ef260bf668bf1f553dbe4e2b25e166d70b1eb9b5. Ahead 1 of cached origin/main; untracked proposal.md. Remote freshness is unverified.
- Browser context names https://github.com/AliciaLuGuyun/STATS401---Clinical-Trial-Attrition, but no matching local checkout was found in bounded searches. Do not conflate that repository with the labs checkout.

### Files inspected
Read complete root proposal.md and nested .publish-lab4/proposal.md, README.md, .gitignore, requirements.txt and full pasted assignment. Enumerated repository files, lab data/scripts, study materials and outputs. No applicable workspace AGENTS.md found. Directory inventory includes css/, js/, lab1–lab10/, data/, study/, work/, outputs/, .tools/ and .publish-lab4/. These are lab/study assets; no clinical-trial pipeline, dataset, final project figures, report or slides identified in the inspected workspace.

### Search and commands
Ran pwd; ls -la; rg --files (including hidden-file/name filters); rg -l for clinicaltrials/attrition/respiratory in source/document files; bounded find across Documents/Desktop/Downloads and home (home depth 5, excluding Library/Zotero/Trash); git status --short --branch, remote -v, branch -vv, rev-parse HEAD, diff and diff --cached; repeated status/remote/HEAD in .publish-lab4; cat on source files; date. Attempted git ls-remote for the clinical-trial repository: failed DNS resolution. No fetch/pull performed: root has no remote and nested checkout targets labs. Web attempts to Canvas and GitHub failed; browser creation/tab inspection timed out. Browser inventory confirmed the named GitHub URL but not its contents.

### Created
PROJECT_PROPOSAL_SUMMARY.md; STATS401_REQUIREMENTS.md; PROJECT_PLAN.md (blocked recovery plan); PROJECT_LOG.md; docs/STATS401_assignment_user_supplied.txt (exact supplied source copy). Wrote documentation with Python pathlib using exclusive creation, and append mode for this log. Existing project files, raw data, README and Git configuration untouched.

### Results, decisions and conflicts
Recovered proposal is depression-trial attrition, not respiratory disease. Root names Alicia/Vera, nested draft uses three placeholders; interim prototype lists also disagree within root proposal. Documented rather than resolved these conflicts. Requirements extraction uses supplied assignment text with explicit live-verification limitation. No requirement invented; original-collection target is conditional. Potential 200–800 candidates versus collection guideline requires clarification, not fabricated expansion.

### Analysis/visualizations
None. No acquisition, package installation, dashboard implementation or restructuring.

### Git checkpoint
No commit/push: intended checkout not identified, root has no history/remote, existing files are untracked and nested remote is a different labs repository. No staging or destructive Git operation performed.

### Unresolved / next step
User must identify intended checkout and resolve respiratory-versus-depression direction. Then verify live course page/links, inspect target data/code, expand execution plan and create a safe meaningful Git checkpoint. Supplied official URL already recorded; do not ask for it again.

### Final documentation verification
Verified archived assignment bytes exactly match attachment; all four Markdown documents exist and are nonempty. Final git status shows original untracked work plus only the new documentation paths. git diff --check returned no errors (untracked files are outside that check). No files staged.

## 2026-09-13 interim session: recovery
User corrected topic to randomized depression trials and authorized existing-repository clone, pipeline, three static figures, interim site and safe publication. Local search found no checkout; GitHub API verified repository and Pages absent. Cloned existing repository into this directory. Baseline main: 8ad2227710f018fc84772a301af5a086e4458872; clean, ahead/behind 0/0; sole source proposal.md read fully, no data/code/site existed. Copied earlier recovery documents verbatim from parent workspace; historical respiratory blockers are superseded. No teammate changes. Commands: find (depth 6), git status/ls-remote/clone/remote/rev-parse/rev-list, rg --files, cat.

## 2026-09-13 interim session: data, figures and local page

Goal: minimum defensible interim milestone, not final dashboard. No prior project data/code existed.

Acquisition: `python3 scripts/acquire.py --output data/raw/2026-09-13`, 335 studies in four full API pages (~24 MB). UTC retrieval and complete query/URLs/hashes in data/processed/source_manifest.json. Pilot of one candidate (temporary /private/tmp/stats401_pilot.json) confirmed schema. Raw full pages remain unchanged and excluded by .gitignore. Query expansion includes related conditions; local rules screen them explicitly.

Processing: `python3 scripts/process.py`. Sequential counts 335→270 randomized→252 parallel→211 explicit major-depression labels→201 without mixed bipolar/schizo labels. Diagnostic ambiguities deferred, no age/year/intervention restrictions. 51 multiple-period and 106 mapping-review flags overlap; no guessed periods/arm classifications. 82 usable trials/221 arms; 80 with completion year. Tables: 201 trials, 403 single-period arms, 1,896 reason entries, 38 pairs. Reason plot subset: 152 arms/55 trials, 845 entries, 2,510 counts, 83 unmerged original labels. Top-ten selection is explicit, with all labels downloadable.

Figures: `.venv/bin/python scripts/figures.py` produces 01_attrition_landscape, 02_arm_differences, 03_reported_reasons in SVG/PNG and exact plot CSVs/findings.json. Median plotted trial 13.1%; paired range −20 to +25 pp (14 experimental higher, 19 comparator higher, 5 equal). Adverse Event 569 is largest individual label. NCT00149643's source 0 completions retained and annotated; no causal inference.

Environment: Python 3.9.6, Matplotlib 3.9.4, pinned `requirements.txt`. pip network mirror and official-index requests failed via proxy; official PyPI metadata and compatible wheels downloaded by curl into /private/tmp/stats401-wheels and installed offline into .venv. No dependency changes outside project. Helper scripts/temporary downloads remain outside version control.

Validation: `.venv/bin/python scripts/validate.py` PASS: unique keys, 403 source arm rows, 1,896 source reason entries, all 38 pair formulas, denominators/ranges, trial aggregation, exact mapping, ordering, missingness and source SHA-256. Reprocess in temporary directory yields byte-identical tables; regenerated SVGs/plot data identical. Manual raw/CSV checks recorded in docs/MANUAL_RECORD_CHECKS.md; all three PNG figures visually inspected. Completion-year missingness is explicit for two usable trials. Local relative link and alt-text checks pass.

Web: `python3 scripts/build_page.py` creates index.html from summaries. Plain HTML/CSS, no framework or JavaScript needed for interim. Dataset, three real figures, per-view plans/purpose, what/how/feedback evaluation and limitations present. Current user instruction (GitHub Pages, no extra framework) takes precedence over Sites hosting workflow; no duplicate publishing site created. Native Chrome successfully loaded localhost after in-app browser timed out. Local server needs permitted sandbox networking. Evaluation is planned; no participant feedback invented.

Files: scripts/acquire.py, process.py, figures.py, validate.py, build_page.py; all data/processed files; figures/; .gitignore; requirements.txt; index.html; style.css; .nojekyll; README.md; docs/DATA_DICTIONARY.md, VISUALIZATION_DESIGN.md, MANUAL_RECORD_CHECKS.md, INTERIM_AUDIT.md; data/raw/README.md. Recovery documents copied unchanged first, then clarification/current-plan sections appended. Original proposal and parent workspace retained.

Git/publication: refreshed origin before staging, pending review/commit. GitHub API confirms Pages currently absent. Existing credential available outside sandbox without display; no new credential or permission grant. Next: review explicit staged paths, commit, normal push, minimally enable Pages from main/root, inspect deployed page in browser and record actual result.

### Pre-commit review
Local Chrome loaded the full page and exposed dataset, all figure sections and evaluation text. Later browser capture was interrupted; public verification remains pending. Full numerical validation rerun after standardizing generated CSV newlines and removing trailing SVG whitespace; results unchanged and byte-reproducibility passes. Original assignment bytes intentionally retained (gitattributes excludes its final blank lines from whitespace lint).

Two Git fetch attempts failed (HTTP/2 error, then connection timeout); read-only GitHub API independently confirmed remote main still at baseline 8ad2227710f018fc84772a301af5a086e4458872. Cached 0/0 divergence is therefore corroborated by fresh API state, not represented as successful fetch. Explicit staging excludes raw snapshots, .venv, caches and temporary helpers. No file exceeds 1 MB among staged deliverables. Next normal push must preserve remote concurrency checks.

### Publication checkpoint and final provenance refinement
Milestone commit b8a330b pushed normally to existing main (8ad2227→b8a330b). GitHub Pages creation returned HTTP 201; main/root, HTTPS enforced, URL https://alicialuguyun.github.io/STATS401---Clinical-Trial-Attrition/. Native Chrome recovered after interruption and rendered the local landscape. Official ClinicalTrials.gov terms were read in Chrome: source attribution, processing date and modification description added/confirmed. All 335 records carry API versionHolder 2026-09-11; extracted this source-processing date into summary and page separately from retrieval date. Added generic sans-serif fallback to generated SVGs so browsers without DejaVu retain readable typography. Re-running required checks before final publication verification.

### Published browser audit
Pages build 1212755503: built, no error, commit b8a330b69ba7f5bc179145f94df2137c03a4f3be. Native Chrome loaded the public root and dataset/evaluation sections, then all three public SVG URLs; screenshots showed actual plotted marks and readable labels. Returned to #evaluation and inspected DevTools Console: 0 messages. Added scripts/check_site.py for exact published HTML/relative-link/asset comparison against local files. Updated README submission link and interim audit. Final source-date/font-fallback changes passed numerical rebuild checks; next commit records this verification and provenance refinement, followed by a normal push and final byte/browser checks. No raw data modified.

### Final release verification — 2026-09-13
Commit 45a8854e73702baac33bce8d44f0e20a605833e2 pushed normally after one connection-timeout retry. GitHub Actions run 34766831699 (`pages build and deployment`) completed successfully for that exact SHA. Native Chrome hard-refreshed the public site and confirmed the new 2026-09-11 source-processing date, three figure sections and final sans-serif SVG typography. Both embedded figures and standalone figure URLs were inspected across the browser audit. No visualization or JavaScript failure; a later console read showed only an optional root favicon.ico 404 (initial console read had no messages). Page remains fully functional.

Supplemental `python3 scripts/check_site.py --output /private/tmp/stats401_deployment_check.json` could not complete: curl timed out on public CSV requests (exit 28), so no all-files checksum PASS is claimed. This is separate from successful browser verification of required content/figures and local relative-path/source checks. Final numerical validation remains PASS; repository was clean and main/origin synchronized at 45a8854 before this documentation-only receipt. No data, figure or site-content changes in this receipt. Next action for user: submit the verified Pages URL to the interim assignment; later review flagged records and implement/evaluate D3 interactions.

## 2026-09-27 — Local research edition: deeper audit, analyses and coordinated D3 essay

### Goal / scope
User requested substantial analytical and visual improvement using current local data; explicitly prohibited commit/push and required preserving the old working version. Worked in the correct nested final-project repository, not the parent labs workspace. Initial `main` HEAD `8ca08cf28ade5dc701ceb2f6a911c6ee31848257`, clean. Remote configured to AliciaLuGuyun/STATS401---Clinical-Trial-Attrition. No fetch or remote mutation needed; cached origin comparison 0/0 is not a fresh remote verification.

### Inspected
Complete proposal, README, recovery/current planning and requirements, project log, data dictionary/design/evaluation documents, scripts/process.py, figures.py, validate.py, static index/style, all raw page structures, processed trial/arm/reason/pair tables and source manifest. Existing site was static; no D3 implementation existed. Corrected topic remains depression clinical trials. No raw files changed or acquired. Official ClinicalTrials.gov definition URLs returned a JS shell through web tooling, so no new claim of live definition verification. D3 documentation and official license were accessible. Spreadsheet skill was consulted for analysis/verification; no workbook was requested or created; project-specific reproducible Python/CSV pipeline retained.

### Main results / decisions
201 eligible trials, 82 usable rates / 221 mapped arms, 38 explicit pairs preserved. Rechecked source hashes, all original arm/reason counts and mappings. Enrollment differs from STARTED in 11 usable trials. One missing protocol arm list is null, not zero. Extended source attributes include intervention sets/names, enrollment/type, exact-date calendar span, site count, allocation and protocol arm count. Full missingness for both 201 eligible and 82 usable cohorts exported. No harmonized randomized count invented.

82-trial median 13.66% (prior 80-with-year plot 13.1%); pooled 3,275/20,949 = 15.63%. Pair median absolute difference 3.52 pp; range −20 to +25. Reason reporting present in 160/201, numerical primary result present in 199/201. Exact mapping passes 95/201; single period 150/201; analytical restrictions are separate from source presence. Industry extraction coverage 52/155 vs OTHER 28/43. All source outcome modules are already downloaded: 330 primary outcomes, 1,888 cells, 306 distinct titles. 14 strictly screened paired MADRS-change outcomes saved as a review queue; timepoints, direction, analysis sets and adjustment differ. No treatment-effect metric or attrition–efficacy chart generated.

Added descriptive rank correlations and subgroup summaries; a four-parameter equal-trial OLS sensitivity (continuous pp outcome, log2 STARTED, industry, any Phase III), HC3 SEs, 2,000 trial-bootstrap samples seed 401, and explicit exclusion sensitivity for the flagged zero-completion record. All three coefficient intervals cross zero; sponsor estimate particularly sensitive. No causal, prediction or significance claim. Calendar span is not participant follow-up and has only 39/82 exact-date records, so not a main explanatory variable.

### Files created / changed
New `scripts/deepen.py`, `scripts/validate_deep.py`, `scripts/check_final.cjs`; `data/analysis/` contains reproducible metrics, coverage, grouping, association, model, mapping, outcome/review and reporting-by-year CSVs plus summary/validation JSON. `final/` contains index.html, style.css, app.js, generated data.json, local D3 7.9.0 and its ISC license. New FINAL_PROJECT_PROGRESS.md, docs/EXTENDED_DATA_DICTIONARY.md, docs/FINAL_BROWSER_CHECK.json. README adds local edition/reproduction instructions; this log appended only. Existing root HTML/CSS, figures, proposal and interim scripts remained byte-identical to baseline. Nothing staged, committed, pushed or deployed.

### Visualization / interaction work
Six-act editorial sequence: collision-distributed trial rates → subgroup distributions/optional continuous context → linked paired dumbbells → coefficient sensitivity → reporting/extraction matrix → trial spotlight with proportional completion bars, original reasons and raw primary values. Seven SVG containers (including continuous foldout). Shared phase/sponsor/search filters, keyboard/click trial selection, linked highlight, persistent selected NCT, reset, pair/comparator sort/filter, reporting review filter/year sort, model sensitivity and count/share reasons. Models deliberately retain fixed sample when exploratory filters change. Sparse categories retain points but no median tick below n=5. Source anomaly remains plotted and labeled. No claim that six sections automatically satisfy final course idiom/complexity requirements.

### Commands / validation
Commands included `git status/branch/log/remote/rev-parse/rev-list/diff --check`, `rg --files`, source/document reads, raw JSON inspections, `.venv/bin/python scripts/validate.py`, `.venv/bin/python scripts/deepen.py`, `.venv/bin/python scripts/validate_deep.py`, Node `--check`, `python3 -m http.server 8000 --bind 127.0.0.1`, and `NODE_PATH=<bundled runtime node_modules> <bundled node> scripts/check_final.cjs`. Node/Python paths obtained from workspace-dependency tool. Python environment remains 3.9.6 / NumPy 2.0.2; existing requirements unchanged. Local D3 reused from existing course project, version header checked; official license preserved.

Original validation PASS: raw hashes, 403 arms, 1,896 reason entries, 38 pairs, exact legacy reproduction. Extended validation PASS: 201 extended records, 330 outcomes, 1,888 source cells/denominators, coverage/group summaries, year counts, model normal equations and byte-identical rebuilt CSV/browser payload. Manual checks documented for NCT04019704, NCT02176291 and NCT03866174 (notably enrollment 347 vs STARTED 104).

Isolated Chrome 153.0.8010.53 browser automation PASS: initial 82/38/201 chart counts; keyboard selection and linked highlight; industry 52/155 filter; comparator filter and signed sort; 103 industry review records; empty search; reset; persisted selection; sensitivity n=81; reason share; continuous missingness; mobile page overflow absent; zero JS errors or failed required assets. Tested source hashes retained in docs/FINAL_BROWSER_CHECK.json. Screenshots under /private/tmp visually reviewed (distribution, intervention groups, dumbbells, model, matrix, trial flow, mobile). Mobile text originally scaled too small; corrected to horizontal chart scrolling at readable size. Long QC tooltip words now wrap. Relative site paths checked; original root site/pipeline bytes checked against HEAD.

Sandbox initially prevented localhost binding and isolated Chrome launch. Allowed escalated runs succeeded; no automatic-review rejection or user blocker remained. No live remote deployment was attempted or claimed. Browser tests are not human usability evaluation.

### Remaining / next
Review multi-period and unmatched-label records with explicit source-backed overrides; adjudicate 14 MADRS candidates before any treatment-effect linkage; version a conservative reason taxonomy; run actual classmate evaluation. Final report/poster, complex-view decision and final course compliance audit remain. The new local edition is reviewable at http://127.0.0.1:8000/final/ while the preview server runs. User requested no Git publication: all new work remains local/uncommitted on the original branch.

## 2026-09-28 — Editorial restructuring, no new statistical analysis

User request read completely from `/Users/guyunlu/.codex/attachments/ca6c6b57-78cc-4a3e-9c81-85eeacac027a/Pasted text.txt`. Goal: one coherent visual argument using validated results, preserve current edition, no commit/push/deployment. Existing working-tree changes from September 27 preserved; no teammate files discarded.

Inspected current HTML/CSS/JS, existing browser checks, analytical outputs and generation code. Before edits, copied complete `final/` to `research-2026-09-27/`; original relative links remain valid. Copied earlier progress/browser-validation files to docs/research-edition-2026-09-27. Wrote docs/NARRATIVE_BASELINE.json with protected raw/processed/analytical/source hashes and backup hashes.

Provenance check: unique NCT sets from trial_metrics, differential_attrition and outcome_review_candidates demonstrate 82 ⊂ 201, 38 ⊂ 82, 14 ⊂ 38; no exceptions. Added scripts/validate_story.py to verify numerical claims, nesting and unchanged analysis/backup bytes and produce final/eligibility.json. This is presentation/provenance validation, not a new statistical analysis. The terminal effect-comparison limitation is text, not a zero-study node. All 38 have numeric primary results; the 14 still need harmonization.

Reorganized final/index.html around opening → distribution → hero paired asymmetry → explanatory limits → analytical eligibility progression → reporting evidence → selected-trial detail → synthesis. Main methodological safeguard: existing model response is overall attrition, not differential attrition. Removed KPI strip/global panel and active continuous-variable exploration; demoted subgroup/specification/outcome/reason detail into disclosures. Existing data and analyses retained byte-for-byte. Hero now displays all 38 rows directly, with default absolute-gap sort, clear sign/zero interpretation, counted extreme examples, linked selection and a compact phone layout. Matrix separates source availability circles from extraction pass/review squares/triangles. Methods near the end retain all prior flags and reproducibility details.

Commands: `.venv/bin/python scripts/deepen.py`, `scripts/validate.py`, `scripts/validate_deep.py`, `scripts/validate_story.py`; Node `--check`; real Chrome via `NODE_PATH=<bundled runtime node_modules> <bundled node> scripts/check_final.cjs`; git status/diff checks and file SHA-256 checks. Local server was already running on port 8000; no existing process stopped. Browser confirmed correct project route. No acquisition or remote mutation.

Checks PASS: legacy/source validation, extended validation, generated analytical byte equality, full backup integrity, nested NCT relationships, browser-displayed claims/bar proportions, chapter order, distinct status encodings, keyboard/Escape and linked selection, all pair sort modes, scoped filters/search/reset/empty state, reporting order/filter, persistent trial, model sensitivity/reason controls. Desktop plus 390/768px viewports: no page overflow, failed required assets or JS errors. Backup route independently loads. Screenshots reviewed; clipped Δ heading and phone hero layout corrected. Updated current browser receipt while retaining prior receipt in backup documentation.

Modified final/index.html, final/style.css, final/app.js, scripts/check_final.cjs, README; appended FINAL_PROJECT_PROGRESS.md and this log. Created eligibility proof/generator and baseline/backup artifacts. No new coefficients, cohorts, outcomes or rates. Remaining: human one-scroll story comprehension test, long-hero pacing, dense supporting-chart mobile scrolling, genuine unresolved outcome comparability. No commit, staging, push or deployment performed.


## 2026-09-28 — Coordinated map presentation pass

- Goal: redesign `/final/` around one linked Attrition Map; no new analyses or pipeline changes; no Git publication.
- Inspected: latest pasted request, final HTML/CSS/JS and payload, existing planning/progress, README, validation scripts, baseline receipts, repository state and existing server.
- Preserved: byte-identical previous edition in `editorial-2026-09-28/`; prior progress/browser script/receipt in `docs/editorial-edition-2026-09-28/`; new backup hashes in `docs/MAP_BASELINE.json`.
- Modified: `final/index.html`, `final/style.css`, `final/app.js`, `scripts/check_final.cjs`, `docs/FINAL_BROWSER_CHECK.json`, README; appended progress and this log.
- Produced: 38-point map, adjacent participant completion bars, linked compact distributions and evidence progression; detailed dumbbell/model/matrix/source tables behind disclosures. Same validated data, no new statistics.
- Commands: `.venv/bin/python scripts/deepen.py`; `.venv/bin/python scripts/validate.py`; `.venv/bin/python scripts/validate_deep.py`; `.venv/bin/python scripts/validate_story.py`; Node/Playwright `scripts/check_final.cjs` against existing localhost server; Python SHA-256 checks of backup and browser source receipts; `git diff --check` and status inspection.
- Validation: original checks PASS and byte-identical rebuild; all map positions checked; selected counts/bars, linked click/keyboard/search, sorting, persistence, source/extraction encodings and mobile checked. Browser initial test found annotation leader intercepting clicks; set pointer-events none and reran successfully. No console errors/asset failures. Desktop/phone screenshots reviewed. Default visible paragraph words 984→77 (92.17% less), with closed disclosures excluded.
- Decisions: fixed scientifically meaningful axes; descriptive median only; no zero-filled nonpaired data. Model remains overall attrition only; 14 review candidates are not effect estimates. Raw source files remain unchanged.
- Open issues: overlapping exact coordinates accessible via search/keyboard; actual user evaluation and outcome harmonization remain future work.
- Git: no staging, commit, push, deployment or history changes. Existing uncommitted work preserved.
- Next step: review the coordinated prototype with classmates and record task-based usability feedback before further redesign.


## 2026-09-28 — Authorized GitHub publication preflight

User authorized normal commit/push and deployment through the existing Pages configuration. Inspected every modified/untracked file by full text/structured-data read, extension, size and credential-pattern scan; reviewed source, generated table schemas/row counts, documentation and diffs. Public registry aggregate data only; no patient records/contact exports. Largest new file is the required 2,074,264-byte browser payload. Identical copies in the two preserved editions share a Git blob. Retained compact validation receipts as intentional audit documentation, not browser profiles/screenshots. Excluded raw snapshots (~24 MB), .venv, .mplconfig, Python caches and all /private/tmp browser screenshots/runtime output. No credentials or local configuration included.

GitHub API verified authenticated user AliciaLuGuyun, remote main at 8ca08cf28ade5dc701ceb2f6a911c6ee31848257, unprotected main with no PR history, and existing Pages main/root configuration. Prior history uses direct commits by Alicia Lu <187429542+AliciaLuGuyun@users.noreply.github.com>; reuse that identity via per-command Git settings. Initial git fetch failed: “Failed to connect to github.com port 443 after 75087 ms: Couldn't connect to server”; fresh read-only API state independently confirms the baseline. Normal push must still enforce remote fast-forward safety; no force or history rewrite.

Re-ran deepen.py, validate.py, validate_deep.py and validate_story.py: PASS, byte-identical analytical rebuild, protected numerical/source hashes unchanged. Re-ran full Chrome check_final.cjs: PASS, desktop/mobile, linked selection/search/sorting, 38 map coordinates and count bars, no JavaScript errors or failed required assets. Next: test the exact staged tree under the GitHub Pages repository URL prefix, inspect staged diff, then commit/push normally and verify remote/deployment. Publication outcomes will be reported after actual verification.

Staged-tree Pages-prefix check PASS: exported only Git index contents (93 files) under `/STATS401---Clinical-Trial-Attrition/` on an isolated local server; full Chrome suite passed against that prefix with zero failed assets/JS errors. All 53 intended changed files pass path/size/credential checks; no deletions or unstaged differences. Both preserved-edition hashes verified. Fresh GitHub API main SHA remains the baseline immediately before commit.


## 2026-09-28 — Accepted audit and frozen five-view implementation

- Read latest user attachment, accepted feasibility audit, current final site, proposal/requirements context, validated payload, processing/validation sources and prior commit. Initial HEAD b4e31963505d3073e49adb88a0f1254c2f1bfe9f; only accepted audit untracked. Prior committed site and two historical backups preserved.
- Changed final/index.html, app.js, style.css; added pure final/dashboard-data.js; updated active browser-check entry point, added check_dashboard.cjs and validate_dashboard.cjs. Updated README and appended progress/log; compact browser receipt updated after validation. No analytical source, raw/processed/analysis output, dependency or cohort changed.
- Implemented four-axis parallel coordinates with real multi-axis brushing, categorical filters, missing-year handling, keyboard range inputs; selected-trial count-conserving Sankey; shared selected/subset state across exact five views; bounded lower charts; source/eligibility distinction retained. No geography, pooled reasons, causal claims or new model.
- Commands: Python temporary build helper; Node --check; .venv/bin/python scripts/deepen.py, validate.py, validate_deep.py, validate_story.py; node scripts/validate_dashboard.cjs; real Chrome scripts/check_final.cjs via bundled Node/Playwright; git diff/status and baseline SHA-256 checks. Preview server had stopped (ERR_CONNECTION_REFUSED), restarted existing root route on port 8000 without changing site architecture.
- Validation: analytical checks PASS and byte-identical outputs; 150 mathematical range intersections, all 38 flow source counts and live SVG thicknesses, 38 map coordinates, real pointer brushes, search/reveal, keyboard, subset empty/error states, sorting, reporting filters, reset, responsive widths1440/1024/768/390. No browser errors or required asset failures after fixes. Screenshots reviewed. Found/fixed D3 brush overlay datum overwrite, Escape tooltip race and selected-row stroke styling during testing.
- Known limits: line overlap, internal narrow-screen scrolling, aggregate rather than individual paths, no human user test or professor approval yet. Current five-view version remains local; public GitHub Pages remains preceding map edition.
- Next: user review, then classmate task-based evaluation. No staging, commit, push or deployment.


## 2026-09-29 — Publish five-view edition at a separate URL

User authorized uploading the dashboard as a new page without covering the previous one. Chosen route: `/five-view/` within the existing main/root Pages site, without a new repository or duplicate Pages configuration. Copied and byte-verified the complete local five-view implementation into five-view/. Restored final/index.html, app.js, style.css, original map browser test and its receipt from the already-published HEAD b4e3196; removed only the duplicate new dashboard-data.js from final/ after verifying its copy. Thus the published root and final/ assets remain byte-identical. Updated five-view-specific validation paths and README reproduction instructions. Raw data, environments, caches, browser screenshots/runtime artifacts remain excluded. Next: validate both routes, inspect explicit commit scope, normal push, and verify public asset bytes for new and preserved pages.

Publication preflight: both full Chrome suites PASS at their independent routes; original analytical validations and 150 subset cases/all 38 Sankey checks PASS. All tracked final/, root index/style and figures equal pre-publication HEAD bytes. New files inspected for size and secret patterns; no raw/local-only files included. Git fetch returned “Empty reply from server”; independent fresh API check used before normal fast-forward push. Five-view browser receipt: docs/FIVE_VIEW_BROWSER_CHECK.json.

Fresh GitHub API confirmed origin main at b4e31963505d3073e49adb88a0f1254c2f1bfe9f and authenticated AliciaLuGuyun; Pages still main/root. New route reproduction links corrected. Browser recheck exposed a scroll-induced tooltip reopening after Escape; corrected pointer-event dismissal only in five-view/app.js and reran the complete suite successfully. Existing final/ unchanged. Proceeding with a normal commit/push, preserving remote concurrency checks.
