/* FitGirl Reimagined — data collection, filtering and rendering.
 * Rule R7: render() is the only function that writes to the overlay DOM
 * (besides the details sheet). Everything it shows derives from state.
 */

function collect() {
  const arts = [...document.querySelectorAll("article")];
  const carousel = parseCarousel();
  state.items = arts.map(parseArticle).filter(Boolean);
  // attach latest flag + better cover from carousel if missing
  for (const it of state.items) {
    if (carousel.has(it.url) || carousel.has(it.url + "/")) it.isLatest = true;
    if (!it.cover || it.cover.includes("data:")) {
      const c = carousel.get(it.url);
      if (c?.cover) it.cover = c.cover;
    }
  }
  state.upcoming = parseUpcoming();
  state.popular = parsePopular();
  state.pager = parsePager();
  const allGenres = new Set();
  state.items.forEach((i) => i.genres.forEach((g) => allGenres.add(g)));
  state.allGenres = [...allGenres].sort();
}

/**
 * @returns {import("./parse.js").RepackItem[]}
 */
function filtered() {
  let arr = [...state.items];
  if (state.onlyFavs) arr = arr.filter((i) => state.favs.has(i.id));
  if (state.genre !== "all") arr = arr.filter((i) => i.genres.includes(state.genre));
  if (state.query) {
    const q = state.query;
    arr = arr.filter((i) =>
      (i.name + " " + i.titleRaw + " " + (i.company || "") + " " + i.genres.join(" ") + " " + (i.version || "")).toLowerCase().includes(q)
    );
  }
  switch (state.sort) {
    case "name": arr.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "smallest": arr.sort((a, b) => (a.repackGB ?? 1e9) - (b.repackGB ?? 1e9)); break;
    case "saving": arr.sort((a, b) => (b.savedPct ?? -1) - (a.savedPct ?? -1)); break;
    default: arr.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }
  return arr;
}

function render() {
  if (!root) return;
  const arr = filtered();
  syncDropdowns();

  metaEl.textContent = state.siteQuery
    ? `Site results for “${state.siteQuery}” · ${arr.length} / ${state.items.length} on this page`
    : `${arr.length} / ${state.items.length} repacks · sorted by ${sortLabel(state.sort)}` +
      (state.query ? ` · “${state.query}”` : "");

  renderPopular();
  renderUpcoming();
  renderGrid(arr);
  renderPager();
}

function renderPager() {
  const p = state.pager;
  if (!p.prev && !p.next) { pagerEl.hidden = true; pagerEl.innerHTML = ""; return; }
  const link = (href, side, inner) => href
    ? `<a class="fg-r-pg" href="${escapeHtml(href)}" rel="${side}">${inner}</a>`
    : `<span class="fg-r-pg is-off" aria-disabled="true">${inner}</span>`;
  pagerEl.hidden = false;
  pagerEl.innerHTML =
    link(p.prev, "prev", `${fgIcon("arrowL")}Newer`) +
    (p.page ? `<span class="fg-r-pg-cur">Page ${escapeHtml(p.page)}</span>` : "") +
    link(p.next, "next", `Older${fgIcon("arrowR")}`);
}

function renderPopular() {
  // parsed from the sidebar "Most Popular Repacks of the Week" widget
  const layoutEl = root.querySelector("#fg-r-layout");
  if (state.showPopular && state.popular.length && !state.query && !state.onlyFavs && state.genre === "all") {
    popularEl.hidden = false;
    layoutEl?.classList.remove("no-pop");
    popularEl.innerHTML = `
        <div class="fg-r-pop-head"><span>Most Popular This Week</span>
        <button id="fg-r-pop-hide">Hide</button></div>
        <div class="fg-r-pop-list">${state.popular.map((p) => `
          <a class="fg-r-pop-item" href="${escapeHtml(p.url)}" data-pop="${escapeHtml(p.url)}" title="${escapeHtml(p.title)}">
            <span class="fg-r-pop-rank">${p.rank}</span>
            ${p.cover ? `<img loading="lazy" src="${escapeHtml(p.cover)}" alt="" />` : `<span class="fg-r-pop-nocover">FG</span>`}
            <span class="fg-r-pop-name">${escapeHtml(p.short)}</span>
          </a>`).join("")}</div>`;
    popularEl.querySelector("#fg-r-pop-hide").addEventListener("click", () => { state.showPopular = false; render(); });
    // open the details sheet; modifier-click / middle-click still opens a new tab.
    // hovering or tabbing to a row prefetches its post so the sheet is instant.
    popularEl.querySelectorAll("[data-pop]").forEach((a) => {
      const entry = state.popular.find((x) => x.url === a.dataset.pop);
      if (!entry) return;
      a.addEventListener("mouseenter", () => fetchPopular(entry), { once: true });
      a.addEventListener("focus", () => fetchPopular(entry), { once: true });
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        openPopular(entry);
      });
    });
  } else {
    popularEl.hidden = true;
    popularEl.innerHTML = "";
    layoutEl?.classList.add("no-pop");
  }
}

function renderUpcoming() {
  // the source post is plain text with no links, so render it as an honest
  // numbered text digest (no chip/click affordance).
  if (state.showUpcoming && state.upcoming.length && !state.query) {
    upcomingEl.hidden = false;
    const shown = state.upcoming.slice(0, FG_LIMITS.upcomingShown);
    upcomingEl.innerHTML = `
        <div class="fg-r-up-head">
          <span>Upcoming <span class="fg-r-up-count">${state.upcoming.length} titles named in the source post</span></span>
          <span class="fg-r-up-actions">
            <button id="fg-r-up-copy">Copy list</button>
            <button id="fg-r-up-hide">Hide</button>
          </span>
        </div>
        <ol class="fg-r-up-list">${shown.map((u) => `<li><span class="fg-r-up-index" aria-hidden="true"></span><span>${escapeHtml(u)}</span></li>`).join("")}</ol>
        ${state.upcoming.length > shown.length ? `<div class="fg-r-up-more">Showing ${shown.length} of ${state.upcoming.length} — plain text, no links on the original post.</div>` : `<div class="fg-r-up-more">Plain text from the original post — no links to open.</div>`}`;
    upcomingEl.querySelector("#fg-r-up-hide").addEventListener("click", () => { state.showUpcoming = false; render(); });
    const copyBtn = upcomingEl.querySelector("#fg-r-up-copy");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard?.writeText(state.upcoming.join("\n")).then(() => {
        copyBtn.textContent = "Copied";
        setTimeout(() => { if (copyBtn.isConnected) copyBtn.textContent = "Copy list"; }, 1200);
      });
    });
  } else {
    upcomingEl.hidden = true;
    upcomingEl.innerHTML = "";
  }
}

/**
 * @param {import("./parse.js").RepackItem[]} arr
 */
function renderGrid(arr) {
  gridEl.innerHTML = arr.map(cardHtml).join("") || `<div class="fg-r-empty">No repacks match. <button id="fg-r-clear">Clear filters</button></div>`;

  gridEl.querySelector("#fg-r-clear")?.addEventListener("click", () => {
    state.query = ""; searchInput.value = ""; state.genre = "all"; state.sort = "newest"; state.onlyFavs = false;
    const favBtn = root.querySelector("#fg-r-favs");
    favBtn?.classList.remove("on");
    favBtn?.setAttribute("aria-pressed", "false");
    render();
  });

  // keep toolbar Saved button in sync when render is triggered elsewhere
  const favBtn = root.querySelector("#fg-r-favs");
  favBtn?.classList.toggle("on", state.onlyFavs);
  favBtn?.setAttribute("aria-pressed", String(state.onlyFavs));
  root.querySelector("#fg-r-favs-n").textContent = state.favs.size || "";

  // direct binding: pages hold ~10 cards, delegation would only add indirection
  gridEl.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.closest("[data-id]")?.dataset.id;
      const item = state.items.find((x) => x.id === id);
      if (!item) return;
      const act = btn.dataset.act;
      if (act === "fav") { state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id); persist(); render(); }
      if (act === "open") openModal(item);
      if (act === "magnet" && item.magnets[0]) navigator.clipboard?.writeText(item.magnets[0].href).then(() => { btn.textContent = "Copied"; setTimeout(render, 900); });
    });
  });
  gridEl.querySelectorAll(".fg-r-card").forEach((c) => {
    c.addEventListener("click", (e) => {
      if (e.target.closest("a,button")) return;
      const item = state.items.find((x) => x.id === c.dataset.id);
      if (item) openModal(item);
    });
  });
}

/**
 * @param {import("./parse.js").RepackItem} it
 * @returns {string}
 */
function cardHtml(it) {
  const isFav = state.favs.has(it.id);
  const saving = it.savedPct != null ? `<span class="fg-r-badge save">−${it.savedPct}%</span>` : "";
  const ver = it.version ? `<span class="fg-r-badge ver">${escapeHtml(it.version)}</span>` : "";
  const latest = it.isLatest ? `<span class="fg-r-badge new">NEW</span>` : "";
  const sizeLine = it.repackSizeStr
    ? `<div class="fg-r-sizes"><b>${escapeHtml(it.repackSizeStr.replace("Repack Size:", "").trim() || it.repackSizeStr)}</b>${it.origSizeStr ? `<span>from ${escapeHtml(it.origSizeStr.replace("Original Size:", "").trim())}</span>` : ""}</div>`
    : `<div class="fg-r-sizes"><span>No size parsed</span></div>`;
  return `
    <article class="fg-r-card" data-id="${escapeHtml(it.id)}">
      <div class="fg-r-cover">
        ${it.cover ? `<img loading="lazy" src="${escapeHtml(it.cover)}" alt="${escapeHtml(it.name)}" />` : `<div class="fg-r-nocover">FG</div>`}
        <div class="fg-r-badges">${latest}${ver}${saving}</div>
        <button class="fg-r-fav ${isFav ? "on" : ""}" data-act="fav" title="${isFav ? "Remove from saved" : "Save this repack"}" aria-label="${isFav ? "Saved — click to remove" : "Save this repack"}" aria-pressed="${isFav}">${fgIcon("bookmark")}</button>
      </div>
      <div class="fg-r-body">
        <div class="fg-r-cat">${escapeHtml(it.cat)}${it.dateShort ? ` · ${escapeHtml(it.dateShort)}` : ""}</div>
        <h3 class="fg-r-name" title="${escapeHtml(it.titleRaw)}">${escapeHtml(it.name)}</h3>
        ${sizeLine}
        <div class="fg-r-genres">${it.genres.slice(0, FG_LIMITS.genresShown).map((g) => `<span>${escapeHtml(g)}</span>`).join("")}</div>
        <p class="fg-r-desc">${escapeHtml(it.desc || "No description parsed from original post.")}</p>
        <div class="fg-r-actions">
          <button data-act="open">Details</button>
          ${it.magnets[0] ? `<button data-act="magnet" title="Copy first magnet link">${fgIcon("copy")}Copy magnet</button>` : ""}
          <a href="${escapeHtml(it.url)}" target="_blank" rel="noopener" class="fg-r-link">Open post${fgIcon("external")}</a>
        </div>
      </div>
    </article>`;
}
