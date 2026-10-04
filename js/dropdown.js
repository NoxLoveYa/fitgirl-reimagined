/* FitGirl Reimagined — custom dropdown (button + listbox).
 * A native <select>'s open list is OS-rendered and cannot be styled,
 * so genre/sort render their own. Full keyboard support included.
 */

/**
 * @param {string} prefix  Element id prefix, e.g. "fg-r-genre" (-btn/-list suffixes)
 * @param {{value:string,label:string}[]} options
 * @param {() => string} getCurrent
 * @param {(value: string) => void} onPick
 */
function initDropdown(prefix, options, getCurrent, onPick) {
  const btn = root.querySelector("#" + prefix + "-btn");
  const list = root.querySelector("#" + prefix + "-list");
  list.innerHTML = options
    .map((o) => `<button role="option" data-value="${escapeHtml(o.value)}" aria-selected="${o.value === getCurrent()}">${escapeHtml(o.label)}</button>`)
    .join("");
  const closeAll = () => {
    root.querySelectorAll(".fg-r-dd-list").forEach((l) => { l.hidden = true; });
    root.querySelectorAll(".fg-r-dd-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
  };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = list.hidden;
    closeAll();
    if (willOpen) {
      list.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      list.querySelector('[aria-selected="true"]')?.focus();
    }
  });
  btn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && list.hidden) { e.preventDefault(); btn.click(); }
  });
  list.addEventListener("click", (e) => {
    const opt = e.target.closest('[role="option"]');
    if (!opt) return;
    onPick(opt.dataset.value);
    closeAll();
    btn.focus();
  });
  list.addEventListener("keydown", (e) => {
    const opts = [...list.querySelectorAll('[role="option"]')];
    const i = opts.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); (opts[i + 1] || opts[0]).focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (opts[i - 1] || opts[opts.length - 1]).focus(); }
    else if (e.key === "Escape") { e.preventDefault(); closeAll(); btn.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#" + prefix + "-dd")) {
      list.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

/** Refresh both dropdown labels/selection from state. Called on every render. */
function syncDropdowns() {
  const gb = root.querySelector("#fg-r-genre-btn span");
  if (gb) gb.textContent = state.genre === "all" ? "All genres" : state.genre;
  const sb = root.querySelector("#fg-r-sort-btn span");
  if (sb) sb.textContent = sortLabel(state.sort);
  const mb = root.querySelector("#fg-r-month-btn span");
  if (mb) mb.textContent = state.siteQuery ? "All months" : state.archives.find((a) => a.key === state.month)?.label || "Latest posts";
  root.querySelectorAll("#fg-r-month-list [role=option]").forEach((o) => {
    o.setAttribute("aria-selected", String(o.dataset.value === state.month));
  });
  root.querySelectorAll("#fg-r-genre-list [role=option]").forEach((o) => {
    o.setAttribute("aria-selected", String(o.dataset.value === state.genre));
  });
  root.querySelectorAll("#fg-r-sort-list [role=option]").forEach((o) => {
    o.setAttribute("aria-selected", String(o.dataset.value === state.sort));
  });
}

/**
 * @param {string} v
 * @returns {string}
 */
function sortLabel(v) {
  return (FG_SORT_OPTS.find((o) => o.value === v) || FG_SORT_OPTS[0]).label;
}
