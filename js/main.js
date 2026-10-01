/* FitGirl Reimagined — entry point. Loads last (see manifest.json).
 * Rule R1: files execute in manifest order and share one scope (classic
 * scripts, no modules — MV3 content scripts). Nothing here runs at load
 * except this boot sequence, so cross-file references always resolve.
 */

if (window.__fgReimaginedBooted) {
  // Already injected (e.g. extension reloaded mid-session) — do not double-boot.
} else {
  window.__fgReimaginedBooted = true;

  if (!location.hostname.includes(FG_HOST)) {
    // Manifest limits us to FG_HOST; this is a second lock on the door.
  } else {
    loadState(() => {
      boot();
      window.addEventListener("keydown", (e) => {
        if (e.key === "/" && document.activeElement !== searchInput && state.enabled) {
          e.preventDefault();
          searchInput?.focus();
        }
        if (e.key === "Escape") closeModal();
      });
      // apply popup changes live without a page reload
      chrome.storage?.onChanged.addListener((changes, area) => {
        if (area !== "local") return;
        let rerender = false;
        if (changes.fg_view?.newValue) { state.view = changes.fg_view.newValue; syncViewSeg(); rerender = true; }
        if (changes.fg_theme?.newValue) { state.theme = changes.fg_theme.newValue; applyTheme(); }
        if (typeof changes.fg_enabled?.newValue === "boolean") {
          state.enabled = changes.fg_enabled.newValue;
          applyVisibility();
          if (state.enabled) rerender = true;
        }
        if (rerender) render();
      });
    });
  }
}

function boot() {
  collect();
  injectShell();
  render();
  applyVisibility();
}
