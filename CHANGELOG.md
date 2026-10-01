# Changelog

All notable changes to FitGirl Reimagined, newest first.
Versioning: patch per user-visible change (see RULES.md R15).

## [0.6.0] — Code audit + modules
- Split the 735-line `content.js` monolith into ordered `js/` modules
  (config, util, parse, store, dropdown, theme, shell, render, sheet, main).
- Removed dead code: unused `SITE` const, unwired hide-feature plumbing,
  unused carousel title field.
- Moved all magic numbers/URLs/regexes into `js/config.js`; JSDoc types
  for repack items, popular entries and state.
- Added RULES.md, LICENSE (MIT), real extension icons.

## [0.5.2] — Clearing a site search returns home
- Emptying the search box on a `?s=` results page navigates back to the
  main page instead of filtering leftovers in place.

## [0.5.1] — Instant popular sheets
- Details sheet opens instantly with a skeleton state; off-page posts fill
  in on fetch. Hover/focus prefetches rail posts (cached). Fetch failures
  show an in-sheet fallback link instead of a surprise new tab.

## [0.5.0] — Custom dropdowns
- Genre and Sort are custom button+listbox dropdowns (native option lists
  are OS-rendered and unstyleable): full theming, arrow-key support,
  `aria-selected`, click-outside to close.

## [0.4.x] — Apple HIG theme + layout
- Full frosted-glass → Apple HIG redesign (see DESIGN.md): semantic color
  tokens with measured contrast, SF type scale, Auto/Light/Dark toggle,
  right popular rail, Upcoming as honest text digest, real site search
  on Enter, film-grain background texture.
