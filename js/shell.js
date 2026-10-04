/* FitGirl Reimagined — overlay shell: toolbar, layout skeleton and wiring.
 * Owns the shared DOM refs (root, gridEl, …). Render and sheet fill them in.
 */

let root, gridEl, upcomingEl, popularEl, metaEl, pagerEl, searchInput;

function injectShell() {
  // top floating toggle (always visible even when disabled)
  const bar = document.createElement("div");
  bar.id = "fg-r-mini";
  bar.innerHTML = `
      <button id="fg-r-toggle" title="Toggle Reimagined UI">FitGirl Reimagined</button>
      <span id="fg-r-count"></span>`;
  document.documentElement.appendChild(bar);
  bar.querySelector("#fg-r-toggle").addEventListener("click", () => {
    state.enabled = !state.enabled;
    persist();
    applyVisibility();
    if (state.enabled) render();
  });

  root = document.createElement("div");
  root.id = "fg-r-root";
  root.innerHTML = `
      <header class="fg-r-top">
        <div class="fg-r-top-in">
          <a class="fg-r-brand" href="${FG_HOME_URL}" title="FitGirl home — unofficial front-end for ${FG_HOST}">
            <span class="fg-r-logo">FG</span>
            <span class="fg-r-title">FitGirl Reimagined</span>
          </a>
          <div class="fg-r-searchwrap">
            ${fgIcon("search")}
            <input id="fg-r-search" type="search" placeholder="Filter repacks · Enter searches the whole site" aria-label="Search repacks" autocomplete="off" />
            <kbd class="fg-r-kbd" aria-hidden="true">/</kbd>
          </div>
          <div class="fg-r-controls">
            <button id="fg-r-favs" title="Show saved only" aria-pressed="false">${fgIcon("bookmark")}<span>Saved</span><span class="fg-r-count" id="fg-r-favs-n"></span></button>
            <div class="fg-r-seg" role="group" aria-label="Layout">
              <button data-view="grid" title="Grid view" aria-label="Grid view">${fgIcon("grid")}</button>
              <button data-view="list" title="List view" aria-label="List view">${fgIcon("list")}</button>
            </div>
            <div class="fg-r-seg" role="group" aria-label="Appearance">
              <button data-theme-opt="system" title="Follow system appearance" aria-label="Follow system appearance">${fgIcon("auto")}</button>
              <button data-theme-opt="light" title="Light appearance" aria-label="Light appearance">${fgIcon("sun")}</button>
              <button data-theme-opt="dark" title="Dark appearance" aria-label="Dark appearance">${fgIcon("moon")}</button>
            </div>
            <button id="fg-r-original" title="Show the original site">${fgIcon("external")}<span>Original</span></button>
          </div>
        </div>
      </header>
      <div class="fg-r-filters">
        <div class="fg-r-dd" id="fg-r-month-dd" hidden>
          <button class="fg-r-dd-btn" id="fg-r-month-btn" aria-haspopup="listbox" aria-expanded="false" title="Browse a month of the archive"><span>Latest posts</span></button>
          <div class="fg-r-dd-list" id="fg-r-month-list" role="listbox" aria-label="Archive month" hidden></div>
        </div>
        <div class="fg-r-dd" id="fg-r-genre-dd">
          <button class="fg-r-dd-btn" id="fg-r-genre-btn" aria-haspopup="listbox" aria-expanded="false" title="Filter by genre/tag"><span>All genres</span></button>
          <div class="fg-r-dd-list" id="fg-r-genre-list" role="listbox" aria-label="Filter by genre" hidden></div>
        </div>
        <div class="fg-r-dd" id="fg-r-sort-dd">
          <button class="fg-r-dd-btn" id="fg-r-sort-btn" aria-haspopup="listbox" aria-expanded="false" title="Sort"><span>Newest</span></button>
          <div class="fg-r-dd-list" id="fg-r-sort-list" role="listbox" aria-label="Sort" hidden></div>
        </div>
        <div class="fg-r-meta" id="fg-r-meta" aria-live="polite"></div>
      </div>
      <div class="fg-r-layout" id="fg-r-layout">
        <div class="fg-r-main">
          <section class="fg-r-upcoming" id="fg-r-upcoming"></section>
          <main class="fg-r-grid" id="fg-r-grid"></main>
          <nav class="fg-r-pager" id="fg-r-pager" aria-label="Pagination" hidden></nav>
        </div>
        <aside class="fg-r-pop" id="fg-r-pop" aria-label="Most popular repacks"></aside>
      </div>
      <footer class="fg-r-foot">
        <span>Unofficial overlay. All content © FitGirl. Data parsed live from the page — no tracking.</span>
        <span><a href="https://fitgirl-repacks.site/faq/" target="_blank" rel="noopener">FAQ</a> · <a href="https://fitgirl-repacks.site/all-my-repacks-a-z/" target="_blank" rel="noopener">A–Z index</a></span>
      </footer>
      <div class="fg-r-modal-back" id="fg-r-modal-back" hidden><div class="fg-r-modal" id="fg-r-modal" role="dialog" aria-modal="true" aria-label="Repack details"></div></div>
    `;
  document.documentElement.appendChild(root);

  searchInput = root.querySelector("#fg-r-search");
  gridEl = root.querySelector("#fg-r-grid");
  upcomingEl = root.querySelector("#fg-r-upcoming");
  popularEl = root.querySelector("#fg-r-pop");
  metaEl = root.querySelector("#fg-r-meta");
  pagerEl = root.querySelector("#fg-r-pager");

  initDropdown(
    "fg-r-genre",
    [{ value: "all", label: "All genres" }, ...(state.allGenres || []).map((g) => ({ value: g, label: g }))],
    () => state.genre,
    (v) => { state.genre = v; render(); }
  );
  // picking a month loads that archive page (the overlay re-boots on it)
  initDropdown(
    "fg-r-month",
    [{ value: "latest", label: "Latest posts" }, ...state.archives.map((a) => ({ value: a.key, label: a.count ? `${a.label} · ${a.count}` : a.label }))],
    () => state.month,
    (v) => { location.href = v === "latest" ? FG_HOME_URL : state.archives.find((a) => a.key === v)?.url || FG_HOME_URL; }
  );
  root.querySelector("#fg-r-month-dd").hidden = !state.archives.length;
  initDropdown("fg-r-sort", FG_SORT_OPTS, () => state.sort, (v) => { state.sort = v; render(); });

  searchInput.addEventListener("input", () => {
    // clearing a site search goes back to the main page — the filtered
    // results only exist on the search URL, empty means "everything"
    if (!searchInput.value.trim() && state.siteQuery) {
      location.href = FG_HOME_URL;
      return;
    }
    state.query = searchInput.value.toLowerCase().trim(); render();
  });
  // Enter triggers a real site-wide search (?s=); the overlay boots on
  // the results page too, so the same UI keeps working there.
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && searchInput.value.trim()) {
      e.preventDefault();
      location.href = fgSearchUrl(searchInput.value.trim());
    }
  });
  // if we landed on a site-search URL, prefill from ?s= and label results
  state.siteQuery = new URLSearchParams(location.search).get("s") || "";
  if (state.siteQuery) {
    state.query = state.siteQuery.toLowerCase().trim();
    searchInput.value = state.siteQuery;
  }
  syncDropdowns();
  root.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
    state.view = b.dataset.view; persist(); syncViewSeg(); render();
  }));
  root.querySelectorAll("[data-theme-opt]").forEach((b) => b.addEventListener("click", () => {
    state.theme = b.dataset.themeOpt; persist(); applyTheme();
  }));
  fgDarkQuery?.addEventListener?.("change", () => { if (state.theme === "system") applyTheme(); });
  root.querySelector("#fg-r-favs").addEventListener("click", (e) => {
    state.onlyFavs = !state.onlyFavs;
    e.currentTarget.classList.toggle("on", state.onlyFavs);
    e.currentTarget.setAttribute("aria-pressed", String(state.onlyFavs));
    render();
  });
  root.querySelector("#fg-r-original").addEventListener("click", () => {
    state.enabled = false; persist(); applyVisibility();
  });
  root.querySelector("#fg-r-modal-back").addEventListener("click", (e) => {
    if (e.target.id === "fg-r-modal-back") closeModal();
  });
  applyTheme();
  syncViewSeg();
}

function syncViewSeg() {
  root.querySelectorAll("[data-view]").forEach((b) => {
    b.classList.toggle("on", b.dataset.view === state.view);
    b.setAttribute("aria-pressed", String(b.dataset.view === state.view));
  });
  gridEl.classList.toggle("is-list", state.view === "list");
}

function applyVisibility() {
  const mini = document.querySelector("#fg-r-mini");
  const count = document.querySelector("#fg-r-count");
  if (count) count.textContent = state.items.length ? `${state.items.length} repacks on page` : "";
  if (state.enabled) {
    document.body.classList.add("fg-r-hide-orig");
    if (root) root.hidden = false;
    if (mini) mini.classList.add("is-on");
  } else {
    document.body.classList.remove("fg-r-hide-orig");
    if (root) root.hidden = true;
    if (mini) mini.classList.remove("is-on");
  }
}
