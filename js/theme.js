/* FitGirl Reimagined — appearance (Auto / Light / Dark).
 * Auto follows the OS via matchMedia. The <body> base color is synced from
 * JS because the overlay root is a sibling of <body>, not its parent,
 * so CSS alone cannot reach it.
 */

const fgDarkQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

/** @returns {"light"|"dark"} */
function resolvedTheme() {
  if (state.theme === "light") return "light";
  if (state.theme === "dark") return "dark";
  return fgDarkQuery?.matches ? "dark" : "light";
}

function applyTheme() {
  if (!root) return;
  const resolved = resolvedTheme();
  root.dataset.theme = resolved;
  document.body.classList.toggle("fg-r-light", resolved === "light");
  syncThemeSeg();
}

function syncThemeSeg() {
  root.querySelectorAll("[data-theme-opt]").forEach((b) => {
    b.classList.toggle("on", b.dataset.themeOpt === state.theme);
    b.setAttribute("aria-pressed", String(b.dataset.themeOpt === state.theme));
  });
}
