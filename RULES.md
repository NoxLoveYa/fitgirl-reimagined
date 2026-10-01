# RULES.md — maintainability rules for this project

Every rule below was applied during the v0.6.0 audit (monolith `content.js`
split into `js/`). New code follows them; fixes that break them get reverted.

## Structure

- **R1 — Ordered classic scripts, one shared scope.** `js/*.js` load in
  manifest order and share top-level scope (MV3 content scripts have no
  modules). No IIFE wrappers, no `import`. Nothing runs at load except
  `main.js`'s boot sequence, so cross-file references always resolve.
  File order and responsibility:
  `config → util → parse → store → dropdown → theme → shell → render → sheet → main`.
- **R2 — One file, one job.** `config` values · `util` pure helpers ·
  `parse` page→data · `store` state+persistence · `dropdown`/`theme` widgets ·
  `shell` DOM skeleton · `render` state→DOM · `sheet` details modal ·
  `main` boot only. A change touches one file; two files means rethink it.
- **R3 — No magic values in logic.** Numbers, URLs, regexes and option lists
  live in `js/config.js` (`FG_LIMITS`, `FG_SORT_OPTS`, `FG_RE`, …).

## Code

- **R4 — Pure helpers.** `util.js` and `parse.js` take input, return data.
  No DOM writes, no `state`, no network, no `chrome.*` there — they stay
  runnable in plain Node for syntax/smoke checks.
- **R5 — Parsers never throw.** Every parser returns data or a safe empty
  (`null` / `[]`). One malformed post must never break the page.
- **R6 — State is the only shared mutable data.** All prefs in `store.js`.
  Storage keys are user data: renaming one orphans saved prefs, so key
  changes ship with a CHANGELOG migration note.
- **R7 — One writer to the DOM.** `render()` (plus the sheet module) owns
  overlay output; everything shown derives from `state`. No component caches
  its own copy of filter/sort/theme values — it reads `state` on render.
- **R8 — Instant UI, async data.** Sheets and rows render immediately;
  network fills in afterwards with stale-guards (`sheetToken`) and cached
  promises (`popCache`). Never block paint on fetch.
- **R9 — Delete dead code on sight.** Unused consts, unwired actions,
  stored-but-never-read options are removed, not commented out. (v0.6.0
  removed: `SITE`, the hide-feature plumbing, unused carousel title.)
- **R10 — YAGNI.** No frameworks, no build step, no dependencies. A new
  dependency needs a written reason in the PR/commit message.

## Interface & style

- **R11 — No false affordances.** Text that isn't clickable must not look
  clickable (Upcoming digest rule); every button does what its label says.
- **R12 — No emoji in UI.** Status is text (`Copied`, `Save`, `Close`).
- **R13 — `fg-r-` prefix on all CSS classes**; tokens via `#fg-r-root`
  custom properties with `[data-theme]` overrides (see DESIGN.md).
- **R14 — Keyboard parity.** Every pointer flow works keyboard-only
  (`/`, `Enter`, `Esc`, arrows in listboxes, visible `:focus-visible`).

## Process

- **R15 — Semver, patch per user-visible change.** `manifest.json` version
  bumps on every behavior/CSS change, noted in CHANGELOG.md.
- **R16 — Verify before ship.** `node --check`-equivalent syntax pass on
  every JS file + CSS brace balance + a real screenshot on
  fitgirl-repacks.site after reloading the unpacked extension.
