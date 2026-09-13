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
