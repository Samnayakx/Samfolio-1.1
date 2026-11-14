# Arcade web screens, live

`assets/arcade-dash/<screen>.html` + `.css` are generated from Paper frames (file "Arcade.dev", page "Web console · Flows"):

| screen | Paper frame | prefix | tags |
|---|---|---|---|
| dash | Dashboard · Active | ax | tags-dash.json |
| usage | Usage · Spend and budget | ux | tags-usage.json |
| approvals | Policies · Approval queue | px | tags-none.json (fully static) |

`*.jsx` is each frame's `get_jsx` output. Regenerate from this folder:

    JSX=usage.jsx PREFIX=ux TAGS=tags-usage.json OUT=../../assets/arcade-dash/usage python3 build.py

Tags map a node path in the JSX tree to a `data-w` hook that `js/case-demos.js` (`adxWire`, `adxUsage`) wires up. `assets/arcade-dash/base.css`
(tokens, stage scaling, hover tooltip) is hand-written and shared. Not converted: the Design system sheet and the three status notes, which stay images.

## Feature explorer screens (`f-*.html`)

The toggle explorers in the Arcade web study (`arcadeFeatures` in `js/case-demos.js`) show 18 more Paper frames as code, one file pair per screen
(`assets/arcade-dash/f-<name>.html` + `.css`, class prefixes `fa`..`fr`). Their JSX sources are in `feat/<name>.jsx` (the Arcade wordmark path is shortened to
`d="LOGO"` in some and filled back in by `build-features.py`). Rebuild all: `python3 build-features.py` (edit the paths at the top to run from this folder).
Frames: Role fork, Quickstart, First call detected, Empty dashboard, Tool catalog, Playground auth, Accounts, Gateway builder, Trace policy blocked, Trace auth expired,
Trace failure states, Policy simulator, Rule conflict, Replay results, Agent summoned, Agent docked, Agent-first home, Agent charts.

`f-agent-home` is the Dashboard shell with a regenerated main area: run `build-agent-home.py` (it reads `dash.jsx`). `feat/trace-states.jsx` was generated, not exported, so re-export from Paper if the frame changes. Run from this folder after adjusting the scratch paths at the top of each script.
