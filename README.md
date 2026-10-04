# FitGirl Reimagined

A clean, modern front-end for [fitgirl-repacks.site](https://fitgirl-repacks.site/)
â€” grid cards, instant search, size insights, and a popular rail. A Chrome/Arc
(MV3) extension that restyles the page in place. No tracking, no servers,
no dependencies.

> Unofficial project. Not affiliated with FitGirl. All repack content belongs
> to its respective owners.

## Features

- **Card grid** with covers, version / NEW / compression-saving badges, and
  original â†’ repack sizes up front
- **Instant filter + real site search** â€” type to filter, Enter runs `?s=` search
- **Most Popular rail** (sticky right column) with hover-prefetch instant sheets
- **Upcoming digest** as an honest numbered text list with copy-to-clipboard
- **Details sheet** per repack: specs, magnet copy buttons, torrent pages
- **Auto / Light / Dark** themes ([DESIGN.md](DESIGN.md))
- **Month picker** for the archive; the pager rolls over to the next/previous month at either end
- **Newer / Older pagination** parsed from the site's own pager
- **Saved list**, genre + sort dropdowns, grid/list layouts, `/` shortcut

## Install (developer mode)

1. Clone or download this repo.
2. Open `chrome://extensions` (or `arc://extensions`), enable **Developer mode**.
3. **Load unpacked** â†’ select this folder.
4. Open [fitgirl-repacks.site](https://fitgirl-repacks.site/) â€” the overlay appears.
   The floating pill (bottom-left) toggles back to the original site anytime.

## Usage

| Action | How |
|---|---|
| Filter loaded repacks | Type in search (or press `/`) |
| Site-wide search | Type + **Enter** |
| Back to homepage | Clear the search box on a results page |
| Details | Click a card, Details, or a popular row |
| Save a repack | Save button on any card |
| Theme | Auto / Light / Dark in the toolbar or popup |

## Project structure

```
manifest.json        MV3 manifest (versioned per change, see CHANGELOG.md)
js/
  config.js          URLs, limits, sort options, page markers (R3)
  util.js            Pure helpers: escapeHtml, gbToNum, normUrl (R4)
  parse.js           Source-page parsers â†’ plain data, never throws (R5)
  store.js           Single state object + chrome.storage prefs (R6)
  dropdown.js        Custom accessible listbox widget
  theme.js           Auto/Light/Dark resolution + application
  shell.js           Toolbar + layout skeleton, owns DOM refs
  render.js          state â†’ DOM: grid, rail, digest (R7)
  sheet.js           Instant details sheet + prefetch cache (R8)
  main.js            Boot sequence only
reimagined.css       Modern zinc/indigo theme, `fg-r-` prefixed (R13)
popup.html / popup.js  Toolbar popup: toggle, layout, theme
icons/               Extension icons
DESIGN.md            Visual system + measured contrast ratios
RULES.md             Maintainability rules every change follows
CHANGELOG.md         Release history
```

## Privacy

Everything runs locally in your browser. The only network calls are the ones
*you* trigger: loading the site itself and prefetching a post when you hover
its popular row. Preferences (theme, layout, saved list) stay in
`chrome.storage.local`. No analytics, no external requests.

## Contributing

Read [RULES.md](RULES.md) first â€” especially R1 (file order/scope), R5
(parsers never throw) and R16 (verify with a real screenshot). Keep it
dependency-free.

## License

MIT â€” see [LICENSE](LICENSE).
