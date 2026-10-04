# Changelog

All notable changes to FitGirl Reimagined, newest first.
Versioning: patch per user-visible change (see RULES.md R15).

## [0.7.1] — Month archive browsing
- New **Month** dropdown in the filter row, built from the site's Monthly
  Archives widget (newest first, with post counts). Picking one loads that
  month; "Latest posts" returns to the homepage.
- The pager rolls over between months: on a month's last page, **Older**
  becomes the previous month's name; on its first page, **Newer** becomes the
  next month's name (both open that month's first page).

## [0.7.0] — Modern redesign
- New neutral zinc + indigo theme replacing the Apple HIG look (see DESIGN.md).
- Header: full-width sticky bar with brand, search and icon controls; genre /
  sort moved to their own filter row beside the result count.
- Pagination: Newer / Older links parsed from the site's own pager, so you
  can browse past the first page of repacks.
- Cards: icon save button (filled when saved), 16:10 covers with hover zoom,
  Copy-magnet and Open-post icons; Saved button shows a live count.
- Details sheet: blurred backdrop, icon close button, `role="dialog"`, focus
  moves to Close on open.
- Popup: on/off switch with status, segmented Layout / Appearance controls.
- No storage keys changed — saved repacks and prefs carry over.

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
