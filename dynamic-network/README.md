# Dynamic reason network — local prototype

Run `python3 -m http.server 8010 --bind 127.0.0.1` from the repository root and visit http://127.0.0.1:8010/dynamic-network/ . No build or new dependencies.

Uses the existing five-view/data.json and bundled D3. Trial–exact-original-reason bipartite graph. Positive valid counts from reconciled arms in usable trials only. Aggregate within trial and reason. Completion year drives cumulative or single-year playback. Missing years excluded. Shared scope uses labels present in at least two trials across the entire dated cohort. Missing edges do not imply zero departures. No changes to source data, no synonym grouping, no patient-level event reconstruction.

Controls: Play/Pause, year slider, cumulative/annual view, shared/all labels, node selection and neighbor navigation, drag/pin, double-click release, zoom/pan, clear selection and reset zoom. Labels prioritize high-count reasons; selecting a node reveals neighboring labels and exact counts. This is a separate preview route; existing dashboard is unchanged. Nothing has been pushed.
