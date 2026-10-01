/* FitGirl Reimagined — details sheet (modal).
 * Rule R8: the sheet opens instantly in all cases. Same-page posts render
 * immediately; off-page posts show a skeleton that fills in on fetch, with
 * hover-prefetch making most clicks instant. sheetToken discards stale fills.
 */

/** @type {Map<string, Promise<import("./parse.js").RepackItem|null>>} */
const popCache = new Map();

/**
 * Fetch + parse a popular post, cached per URL. Never rejects (null on failure).
 * @param {import("./parse.js").PopularEntry} p
 * @returns {Promise<import("./parse.js").RepackItem|null>}
 */
function fetchPopular(p) {
  if (!popCache.has(p.url)) {
    popCache.set(p.url, fetch(p.url, { credentials: "same-origin" })
      .then((r) => { if (!r.ok) throw new Error("http " + r.status); return r.text(); })
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const art = [...doc.querySelectorAll("article")].find(
          (a) => !FG_RE.upcomingTitle.test(a.querySelector("h1")?.innerText || "")
        );
        return (art && parseArticle(art)) || null;
      })
      .catch(() => null));
  }
  return popCache.get(p.url);
}

let sheetToken = 0;

/**
 * @param {string} html
 * @returns {Element} the modal element
 */
function openSheet(html) {
  const back = root.querySelector("#fg-r-modal-back");
  const modal = root.querySelector("#fg-r-modal");
  back.hidden = false;
  modal.innerHTML = html;
  wireModal(modal);
  return modal;
}

/** @param {Element} modal */
function wireModal(modal) {
  modal.querySelector("#fg-r-m-close")?.addEventListener("click", closeModal);
  modal.querySelectorAll("[data-mag]").forEach((b) => b.addEventListener("click", () => {
    navigator.clipboard?.writeText(b.dataset.mag);
    b.textContent = "Copied";
  }));
}

/**
 * Popular rail click → details sheet, opened instantly.
 * @param {import("./parse.js").PopularEntry} p
 */
function openPopular(p) {
  const token = ++sheetToken;
  const direct = state.items.find((x) => normUrl(x.url) === normUrl(p.url));
  if (direct) { openModal(direct); return; }
  const modal = openSheet(loadingSheetHtml(p));
  fetchPopular(p).then((parsed) => {
    if (token !== sheetToken || root.querySelector("#fg-r-modal-back").hidden) return;
    modal.innerHTML = parsed ? modalBodyHtml(parsed) : errorSheetHtml(p);
    wireModal(modal);
  });
}

/**
 * @param {import("./parse.js").RepackItem} it
 */
function openModal(it) {
  sheetToken++;
  openSheet(modalBodyHtml(it));
}

/**
 * @param {import("./parse.js").RepackItem} it
 * @returns {string}
 */
function modalBodyHtml(it) {
  return `
      <div class="fg-r-m-head">
        <div>
          <div class="fg-r-cat">${escapeHtml(it.cat)}${it.dateShort ? ` · ${escapeHtml(it.dateShort)}` : ""}</div>
          <h2>${escapeHtml(it.titleRaw)}</h2>
          <div class="fg-r-m-specs">
            ${it.company ? `<span><b>Studio:</b> ${escapeHtml(it.company)}</span>` : ""}
            ${it.languages ? `<span><b>Langs:</b> ${escapeHtml(it.languages)}</span>` : ""}
            ${it.origSizeStr ? `<span><b>Original:</b> ${escapeHtml(it.origSizeStr)}</span>` : ""}
            ${it.repackSizeStr ? `<span><b>Repack:</b> ${escapeHtml(it.repackSizeStr)}</span>` : ""}
            ${it.savedPct != null ? `<span class="fg-r-badge save">Save ${it.savedPct}%</span>` : ""}
          </div>
          <div class="fg-r-genres big">${it.genres.map((g) => `<span>${escapeHtml(g)}</span>`).join("")}</div>
        </div>
        <button id="fg-r-m-close" aria-label="Close dialog">Close</button>
      </div>
      <div class="fg-r-m-grid">
        <div>${it.cover ? `<img class="fg-r-m-cover" src="${escapeHtml(it.cover)}" alt="" />` : ""}<p class="fg-r-m-desc">${escapeHtml(it.desc || "")}</p>
        <a class="fg-r-m-open" href="${escapeHtml(it.url)}" target="_blank" rel="noopener">Open full original post (mirrors, install notes)</a></div>
        <div>
          <h4>Torrents / magnets</h4>
          ${it.magnets.length ? it.magnets.map((m) => `<div class="fg-r-m-row"><span>${escapeHtml(m.label.slice(0, 80))}</span><button data-mag="${escapeHtml(m.href)}">Copy</button> <a href="${escapeHtml(m.href)}">Open</a></div>`).join("") : "<p class='fg-r-muted'>No magnet parsed on list page — open the post.</p>"}
          <h4>Torrent pages</h4>
          ${it.torrents.length ? it.torrents.map((t) => `<div class="fg-r-m-row"><a href="${escapeHtml(t.href)}" target="_blank" rel="noopener">${escapeHtml(t.label)}</a></div>`).join("") : "<p class='fg-r-muted'>—</p>"}
          ${it.screenshots.length ? `<h4>Screenshots</h4><div class="fg-r-m-shots">${it.screenshots.map((s) => `<a href="${escapeHtml(s)}" target="_blank" rel="noopener"><img loading="lazy" src="${escapeHtml(s)}" /></a>`).join("")}</div>` : ""}
        </div>
      </div>`;
}

/**
 * @param {import("./parse.js").PopularEntry} p
 * @returns {string}
 */
function loadingSheetHtml(p) {
  return `
      <div class="fg-r-m-head">
        <div>
          <div class="fg-r-cat">Most popular · #${p.rank}</div>
          <h2>${escapeHtml(p.title)}</h2>
          <div class="fg-r-m-specs"><span>Fetching post details…</span></div>
        </div>
        <button id="fg-r-m-close" aria-label="Close dialog">Close</button>
      </div>
      <div class="fg-r-m-grid">
        <div>${p.cover ? `<img class="fg-r-m-cover" src="${escapeHtml(p.cover)}" alt="" />` : ""}
        <div class="fg-r-sk" style="height:14px;margin-top:12px"></div>
        <div class="fg-r-sk" style="height:14px;width:82%"></div>
        <div class="fg-r-sk" style="height:14px;width:68%"></div></div>
        <div>
          <h4>Torrents / magnets</h4>
          <div class="fg-r-sk" style="height:38px"></div>
          <div class="fg-r-sk" style="height:38px"></div>
          <h4>Torrent pages</h4>
          <div class="fg-r-sk" style="height:38px"></div>
        </div>
      </div>`;
}

/**
 * @param {import("./parse.js").PopularEntry} p
 * @returns {string}
 */
function errorSheetHtml(p) {
  return `
      <div class="fg-r-m-head">
        <div>
          <div class="fg-r-cat">Most popular · #${p.rank}</div>
          <h2>${escapeHtml(p.title)}</h2>
        </div>
        <button id="fg-r-m-close" aria-label="Close dialog">Close</button>
      </div>
      <p class="fg-r-muted">Could not load the post details. Open the original post instead:</p>
      <p><a class="fg-r-m-open" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">Open original post</a></p>`;
}

function closeModal() {
  const back = root?.querySelector("#fg-r-modal-back");
  if (back) back.hidden = true;
}
