# DESIGN.md — visual system (v0.7)

Applies to the **FitGirl Reimagined** overlay (`reimagined.css`, `js/shell.js`,
`js/render.js`, `popup.html`). Replaces the earlier Apple HIG theme.

## Principles

- **Content first.** Neutral zinc surfaces; the only color is one indigo accent
  plus green for sizes/savings. Borders (1px, low-contrast) separate surfaces
  instead of heavy shadows.
- **Findable controls.** Header = identity, search, global toggles (Saved,
  layout, appearance, Original). The filter row under it holds what narrows
  the list (genre, sort) next to the result count.
- **Quiet chrome.** Icon-only segmented controls with `aria-label`/`title`;
  text only where an action needs a verb (Details, Copy magnet).
- **Browsable.** Newer / Older pager is parsed from the site's own
  `.paging-navigation` links.

## Tokens (`#fg-r-root`, `[data-theme="light"]` overrides)

| Token | Dark | Light |
|---|---|---|
| `--fg-bg` / `--fg-card` | `#09090b` / `#111113` | `#f6f6f8` / `#ffffff` |
| `--fg-fill` / `--fg-fill-2` | `#1c1c1f` / `#27272a` | `#f0f0f3` / `#e4e4e8` |
| `--fg-label` / `-2` / `-3` | `#fafafa` / `#a1a1aa` / `#8b8b94` | `#18181b` / `#52525b` / `#71717a` |
| `--fg-accent` (fills) | `#4f46e5` | `#4f46e5` |
| `--fg-accent-text` | `#a5b4fc` | `#4338ca` |
| `--fg-green` | `#4ade80` | `#15803d` |

Measured contrast (WCAG relative luminance): primary text 18.1 / 17.7,
secondary 7.4 / 7.7 (on cards; 6.6 / 6.8 on fills), accent text 9.5 / 7.9,
green figures 10.8 / 5.0, white on accent fill 6.3, white on light green
badge 5.0, dark save badge text 8.6. Dark `label-3` was raised from `#71717a`
(3.9) to `#8b8b94` after measurement; light `label-3` is 4.8. `label-3` is
for placeholders and decorative indices only.

## Type, space, shape

- Font: `Inter` if installed, else the system UI stack. Base 14px; card
  title 16/650; eyebrows 11px uppercase +0.06em; sizes use `tabular-nums`.
- 4/8px spacing. Radii: 6 (chips, badges), 8 (buttons), 10 (fields, segmented),
  12 (cards, panels), 16 (sheet).
- Controls 36px tall (search 38px); compact rail/sheet buttons 28px.
- Layout: max 1680px, 24px gutters, 320px sticky popular rail
  (stacks below 1024px, single column and icon-only buttons under 760px).

## Materials

Header, floating pill, badges, save button and sheet backdrop use `blur()`.
`prefers-reduced-transparency` removes all blur (header falls back to card
color). `prefers-reduced-motion` removes hover lift/zoom/shimmer.
`prefers-contrast: more` deepens secondary text and borders.

## Accessibility checklist

- [x] Icon-only buttons have `aria-label` + `title`; toggles use `aria-pressed`.
- [x] Sheet is `role="dialog" aria-modal="true"`; focus moves to Close on open;
      `Esc` closes; backdrop click closes.
- [x] Result count is `aria-live="polite"`.
- [x] `/` focuses search; dropdowns support arrow keys; 2px `:focus-visible` ring.
- [ ] Open: focus is not trapped inside the sheet and not restored to the
      opener on close.

## Verify

1. Reload the unpacked extension, open `https://fitgirl-repacks.site/`.
2. Toggle layout and appearance; resize below 1024px and 760px.
3. Click Older / Newer at the bottom of the grid.
4. Open a card and a popular row; check focus lands on Close, `Esc` closes.
