# DESIGN.md — Apple Human Interface Guidelines audit

Applies to the **FitGirl Reimagined** overlay (`content.js` + `reimagined.css`, v0.4.0).
Method: walked Apple's HIG foundations (Typography, Color, Dark Mode, Layout,
Materials, App Icons imagery omitted — extension placeholder art, Accessibility:
VoiceOver/Keyboard/Motion/Contrast) against the shipped UI, fixed what failed,
documented what was deliberately left non-Apple.

## 1. Principles — Clarity, Deference, Depth

| Principle | Application |
|---|---|
| Clarity | SF system font stack, 16px semibold card titles, 11px bold uppercase eyebrows, tabular numerals for sizes/ranks. No decorative gradients behind text. |
| Deference | Content-first: flat grouped backgrounds (`#000` / `#F2F2F7`), hairline separators instead of heavy panels. Chrome (toolbar, rail) uses translucent material so content shows through. |
| Depth | One floating toolbar (material blur), cards separated by hairlines + a single soft shadow **in light mode only** (dark mode separates by borders, per HIG). Detail view is a centered sheet over a dimmed backdrop. |

## 2. Typography (SF scale, adapted)

System stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui…`
with `-webkit-font-smoothing: antialiased`. No custom webfonts (zero download, native feel).

| Element | Style | HIG analogue |
|---|---|---|
| Toolbar title | 17px / 700, −0.2px tracking | Navigation Title |
| Card title | 16px / 600, 2-line clamp | Headline |
| Section headers | 15px / 700 | Headline |
| Body / description | 13.5px / 1.55, secondary color | Body / Subhead |
| Eyebrow (category) | 11px / 700, uppercase, +0.8px tracking, accent color | Caption 1 (emphasized) |
| Counts / sizes | 12.5–14px, `tabular-nums` | Footnote + tabular figures |
| Sheet title | 20px / 700 | Title 3 |

## 3. Color — semantic tokens, measured contrast

Two token sets on `#fg-r-root` (`[data-theme="light"]` overrides). Accent is
system blue, not a brand gradient: **Light `#007AFF` / Dark `#0A84FF`**.
Text links use darker/lighter variants so *body-size text* passes WCAG AA.

Measured with relative-luminance (WCAG formula), Node, this repo:

| Pair | Ratio | Bar |
|---|---|---|
| Dark primary `#FFF` on card `#2C2C2E` | **13.9** | 4.5 ✓ |
| Dark secondary 60% on card | **5.3** | 4.5 ✓ |
| Dark link `#53A6FF` on card | **5.5** | 4.5 ✓ |
| Dark size figure `#30D158` on card | **6.9** | 4.5 ✓ |
| Light primary `#000` on `#FFF` | **21.0** | 4.5 ✓ |
| Light secondary 75% `#6D6D72` on `#FFF` | **5.2** | 4.5 ✓ |
| Light link `#0060CE` on `#FFF` | **5.9** | 4.5 ✓ |
| Light size figure `#1E7E34` on `#FFF` | **5.1** | 4.5 ✓ |
| White on filled `#007AFF` button | 4.0 | 3.0 (UI control) ✓ |
| White on filled `#0A84FF` button | 3.7 | 3.0 (UI control) ✓ |

Notes:
- Small body/description text always uses the 75%-opacity secondary in light
  mode (the stock 60% secondary only reaches 3.4:1 — fine for large/bold, not
  for 13px body, so it is **not** used there).
- Eyebrow labels use accent-text color (`#0060CE` / `#53A6FF`) instead of gray,
  which both passes and reads as metadata rather than decoration.
- Filled buttons ship white-on-systemBlue exactly as iOS does; they clear the
  3:1 non-text/component bar and carry bold 13px labels.
- Tertiary (30%) gray is decorative only (search hint glyph, scroll thumbs).

## 4. Layout, spacing, targets

- **8pt grid**: paddings/gaps are 8 / 12 / 16 / 20 / 24. Radii: 8 (rows),
  10 (buttons/fields), 14 (cards/sheets), 16 (toolbar).
- **Targets**: toolbar controls, search field, card actions, sheet Close are
  38–40px tall (desktop adaptation of the 44pt HIG minimum; nothing is
  smaller than 32px, and 32px items are supplementary Hide/Copy buttons).
- **Readable width**: page caps at 1760px; sheet caps at 960px; sheet body copy
  caps at 65ch.
- **Right rail** (Most Popular): 300px, sticky (`top: 84px`), independently
  scrollable with thin system-colored scrollbars; collapses below the main
  column as a horizontal snap row under 1024px, single column under 760px.
- Destructive/irreversible actions: none exist (Hide is per-device and
  Clear-filters restores Saved-filter state; no data leaves the device).

## 5. Materials and bars

- Toolbar / toggle pill: `blur(20px) saturate(180%)`, `rgba(28,28,30,.72)` dark /
  `rgba(249,249,249,.8)` light — the HIG toolbar-material recipe.
- Cover badges and Save pill: `blur(8px)` over a 72%-black scrim so they stay
  legible on any artwork.
- Sheet backdrop: 40%-black dim (depth), no blur tax on the page behind it.
- `prefers-reduced-transparency` kills all backdrop blur and falls back to
  solid card color. `prefers-contrast: more` deepens secondary text and
  separators in both themes.

## 6. Controls (iOS mapping)

| Extension control | iOS equivalent | Notes |
|---|---|---|
| Grid/List, Auto/Light/Dark | Segmented control | Gray track, thumb + shadow selection, `role="group"` + label |
| Search | Search field | Gray fill, 10px radius, persistent `/` shortcut hint |
| Genre / Sort | Listbox (custom) | Native select lists are OS-rendered, so both render a styled button + listbox with arrow-key support and `aria-selected` |
| Details / Save / Copy | Filled + Gray buttons | Filled = primary action; gray = secondary; `:active` darkens |
| Sheet | Sheet / popover | Centered, 16px radius, max-height + internal scroll |
| Upcoming digest | Editorial text list | Source post has no links, so no chip/button affordance: numbered two-column text with hairline rules, one real action (Copy list) |

## 7. Appearance system (Auto / Light / Dark)

- `Auto` (default) follows `prefers-color-scheme` live via `matchMedia`.
- Choice persists in `chrome.storage.local` (`fg_theme`) and applies instantly
  across open tabs via `storage.onChanged` — no reload needed.
- Popup mirrors the same three options and uses `color-scheme: light dark`
  with `Canvas`/`AccentColor` system colors so it adapts for free.
- The `<body>` base color is synced from JS (`fg-r-light`) because the overlay
  root is a sibling of `<body>`, not its parent — CSS alone cannot reach it.

## 8. Accessibility checklist

- [x] Every icon-less button has a text label (`Grid`, `Save`, `Copy`, `Close`).
- [x] `aria-pressed` on Save/Saved toggles; `role="group"` + `aria-label` on
      segmented groups; sheet Close has `aria-label="Close dialog"`.
- [x] Full keyboard path: `/` focuses search, `Escape` closes the sheet,
      `:focus-visible` 3px accent ring on all controls.
- [x] `prefers-reduced-motion` disables lift/hover transitions.
- [x] Contrast table above; numerals use `tabular-nums` so sizes don't jitter.
- [ ] Open: VoiceOver rotor order on the virtualized card grid (single-page
      DOM, acceptable for v1); Dynamic Type text scaling beyond 100% will wrap
      (clamps are line-based, layout does not break, verified by inspection).

## 9. Deliberate deviations from HIG

1. **Rank medals (gold/silver/bronze)** — kept for the top-3 popular rows;
   culturally expected in a "most popular" list, purely decorative, never the
   sole carrier of meaning (rank number is always present as text).
2. **Magnet-copy buttons** — no iOS equivalent; styled as secondary gray
   buttons with explicit `Copy`/`Copied` feedback text.
3. **Compact 38–40px targets** instead of 44pt — desktop pointer UI; nothing
   interactive sits below 32px.
4. **Floating toolbar** instead of an edge-anchored bar — keeps the overlay
   visually distinct from the underlying site while staying reachable.

## 10. Verify

1. Load unpacked, open `https://fitgirl-repacks.site/`.
2. Toggle Auto/Light/Dark in the toolbar; change OS appearance with Auto set.
3. Tab through the page: search → filters → cards → rail; `Esc` closes sheet.
4. macOS: System Settings → Accessibility → Display → Reduce transparency /
   Increase contrast; confirm blur drops out and text deepens.
