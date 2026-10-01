/* FitGirl Reimagined — overlay shell: toolbar, layout skeleton and wiring.
 * Owns the shared DOM refs (root, gridEl, …). Render and sheet fill them in.
 */

let root, gridEl, upcomingEl, popularEl, metaEl, searchInput;

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
        <a class="fg-r-brand" href="${FG_HOME_URL}" title="FitGirl home">
          <span class="fg-r-logo">FG</span>
          <span>
            <span class="fg-r-title">FitGirl Reimagined</span>
            <span class="fg-r-sub">Unofficial modern front-end · ${FG_HOST}</span>
          </span>
        </a>
        <div class="fg-r-searchwrap">
          <span class="fg-r-kbd">/</span>
          <input id="fg-r-search" type="search" placeholder="Search all repacks… Enter runs site-wide search" autocomplete="off" />
        </div>
        <div class="fg-r-controls">
          <div class="fg-r-dd" id="fg-r-genre-dd">
            <button class="fg-r-dd-btn" id="fg-r-genre-btn" aria-haspopup="listbox" aria-expanded="false" title="Filter by genre/tag"><span>All genres</span></button>
            <div class="fg-r-dd-list" id="fg-r-genre-list" role="listbox" aria-label="Filter by genre" hidden></div>
          </div>
          <div class="fg-r-dd" id="fg-r-sort-dd">
            <button class="fg-r-dd-btn" id="fg-r-sort-btn" aria-haspopup="listbox" aria-expanded="false" title="Sort"><span>Newest</span></button>
            <div class="fg-r-dd-list" id="fg-r-sort-list" role="listbox" aria-label="Sort" hidden></div>
          </div>
          <div class="fg-r-seg" role="group" aria-label="Layout">
            <button data-view="grid" title="Grid view">Grid</button>
            <button data-view="list" title="List view">List</button>
          </div>
          <div class="fg-r-seg" role="group" aria-label="Appearance">
            <button data-theme-opt="system" title="Follow system appearance">Auto</button>
            <button data-theme-opt="light" title="Light appearance">Light</button>
            <button data-theme-opt="dark" title="Dark appearance">Dark</button>
          </div>
          <button id="fg-r-favs" title="Show saved only" aria-pressed="false">Saved</button>
          <button id="fg-r-original" title="Show original site">Original</button>
        </div>
      </header>
      <div class="fg-r-meta" id="fg-r-meta"></div>
      <div class="fg-r-layout" id="fg-r-layout">
        <div class="fg-r-main">
          <section class="fg-r-upcoming" id="fg-r-upcoming"></section>
          <main class="fg-r-grid" id="fg-r-grid"></main>
        </div>
        <aside class="fg-r-pop" id="fg-r-pop" aria-label="Most popular repacks"></aside>
      </div>
      <footer class="fg-r-foot">
        <span>Unofficial overlay. All content © FitGirl. Data parsed live from the page — no tracking.</span>
        <span><a href="https://fitgirl-repacks.site/faq/" target="_blank" rel="noopener">FAQ</a> · <a href="https://fitgirl-repacks.site/all-my-repacks-a-z/" target="_blank" rel="noopener">A–Z index</a></span>
      </footer>
      <div class="fg-r-modal-back" id="fg-r-modal-back" hidden><div class="fg-r-modal" id="fg-r-modal"></div></div>
    `;
  document.documentElement.appendChild(root);

  searchInput = root.querySelector("#fg-r-search");
  gridEl = root.querySelector("#fg-r-grid");
  upcomingEl = root.querySelector("#fg-r-upcoming");
  popularEl = root.querySelector("#fg-r-pop");
  metaEl = root.querySelector("#fg-r-meta");

  initDropdown(
    "fg-r-genre",
    [{ value: "all", label: "All genres" }, ...(state.allGenres || []).map((g) => ({ value: g, label: g }))],
    () => state.genre,
    (v) => { state.genre = v; render(); }
  );
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
  root.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("on", b.dataset.view === state.view));
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
