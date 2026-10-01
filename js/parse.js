/* FitGirl Reimagined — source-page parsers.
 * Rule R5: parsers are pure (Element in, plain data out) and never touch
 * overlay state, so they stay testable without a browser.
 */

/**
 * @typedef {Object} RepackItem
 * @property {string} id
 * @property {string} name            Short display name (version stripped)
 * @property {string} titleRaw        Full post title
 * @property {string} url             Canonical post URL
 * @property {string} cat             Category label
 * @property {string} date            ISO datetime (for sorting)
 * @property {string} dateShort       Display date
 * @property {string[]} genres
 * @property {string|null} company
 * @property {string|null} languages
 * @property {string|null} origSizeStr
 * @property {string|null} repackSizeStr
 * @property {number|null} origGB
 * @property {number|null} repackGB
 * @property {number|null} savedPct
 * @property {string|null} version
 * @property {string} cover
 * @property {string} desc
 * @property {{label:string,href:string}[]} magnets
 * @property {{label:string,href:string}[]} torrents
 * @property {string[]} screenshots
 * @property {boolean} [isLatest]     Attached by collect(), not the parser
 */

/**
 * @typedef {Object} PopularEntry
 * @property {number} rank
 * @property {string} title
 * @property {string} short
 * @property {string} cover
 * @property {string} url
 */

/**
 * Parse one repack post. Returns null for non-repack articles (Upcoming…).
 * Never throws — a single malformed post must not break the page.
 * @param {Element} article
 * @returns {RepackItem|null}
 */
function parseArticle(article) {
  try {
    const titleEl = article.querySelector("h1.entry-title a, h1.entry-title, h1 a, h2 a");
    const titleRaw = (titleEl?.innerText || article.querySelector("h1")?.innerText || "Untitled").trim();
    const url = titleEl?.href || article.querySelector("h1 a")?.href || location.href;

    if (FG_RE.upcomingTitle.test(titleRaw)) return null; // handled separately

    const cat = article.querySelector(".cat-links a")?.innerText?.trim() || "Repack";
    const timeEl = article.querySelector("time");
    const date = timeEl?.getAttribute("datetime") || timeEl?.innerText || "";
    const dateShort = timeEl?.innerText?.trim() || "";

    const text = article.innerText || "";
    const get = (re) => {
      const m = text.match(re);
      return m ? m[1].trim() : null;
    };

    const genresRaw = get(/Genres\/Tags:\s*([^\n]+)/i);
    const company = get(/Company:\s*([^\n]+)/i);
    const languages = get(/Languages:\s*([^\n]+)/i);
    const origSizeStr = get(/Original Size:\s*([^\n]+)/i);
    const repackSizeStr = get(/Repack Size:\s*([^\n]+)/i);

    const genres = genresRaw
      ? genresRaw
        .split(FG_RE.nextSpecField)[0]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, FG_LIMITS.genresPerCard)
      : [];

    const imgEl =
      article.querySelector(".entry-content img.alignleft") ||
      article.querySelector(".entry-content img") ||
      article.querySelector("img");
    const cover = imgEl?.src || "";

    // description: first long <p> after the specs, else the Game Description section
    let desc = "";
    const paras = [...article.querySelectorAll(".entry-content p")];
    for (const p of paras) {
      const t = p.innerText.trim();
      if (t.length > FG_LIMITS.descMinChars && !/Genres\/Tags|Company:|Original Size:|Download Mirrors/i.test(t)) {
        desc = t.slice(0, FG_LIMITS.descChars);
        break;
      }
    }
    if (!desc) {
      const m = text.match(/Game Description\s*([\s\S]{80,600})/i);
      if (m) desc = m[1].replace(/\s+/g, " ").slice(0, FG_LIMITS.descChars);
    }

    const magnets = [...article.querySelectorAll('a[href^="magnet:"]')].map((a) => ({
      label: (a.closest("li")?.innerText || a.innerText || "magnet").slice(0, 120),
      href: a.href,
    })).slice(0, FG_LIMITS.magnetsMax);
    const torrents = [...article.querySelectorAll(".entry-content a")]
      .filter((a) => FG_RE.torrentHost.test(a.href))
      .map((a) => ({ label: a.innerText.slice(0, 60) || a.hostname, href: a.href }))
      .slice(0, FG_LIMITS.torrentsMax);
    const screenshots = [...article.querySelectorAll(".entry-content img")]
      .map((i) => i.src)
      .filter((s) => s && s !== cover)
      .slice(0, FG_LIMITS.screenshotsMax);

    const origGB = gbToNum(origSizeStr);
    const repackGB = gbToNum(repackSizeStr);
    const savedPct = origGB && repackGB ? Math.round((1 - repackGB / origGB) * 100) : null;

    // version extraction: "– v1.2.0" or ", v1.2"
    const verMatch = titleRaw.match(/[–\-,]\s*(v[\d.]+[a-z\d.]*)/i);
    const version = verMatch ? verMatch[1] : null;
    const name = titleRaw.replace(/[–\-,]\s*v[\d.,]+.*$/i, "").replace(/\s{2,}/g, " ").trim() || titleRaw;

    const id = url.replace(/\/$/, "").split("/").pop() || titleRaw;

    return {
      id, name, titleRaw, url, cat, date, dateShort,
      genres, company, languages, origSizeStr, repackSizeStr,
      origGB, repackGB, savedPct, version, cover, desc,
      magnets, torrents, screenshots,
    };
  } catch (e) {
    console.warn("[FG-R] parseArticle failed:", e);
    return null;
  }
}

/**
 * Extract the plain-text Upcoming list (deduped, capped).
 * @returns {string[]}
 */
function parseUpcoming() {
  const out = [];
  const arts = [...document.querySelectorAll("article")];
  for (const a of arts) {
    const h = a.querySelector("h1")?.innerText || "";
    if (!/UPCOMING/i.test(h)) continue;
    const lines = a.innerText.split("\n").map((s) => s.trim()).filter((s) => FG_RE.upcomingBullet.test(s));
    for (const ln of lines) {
      const clean = ln.replace(/^[⇢→>\s]+/, "").trim();
      if (clean) out.push(clean);
    }
  }
  return [...new Set(out)].slice(0, FG_LIMITS.upcomingCap);
}

/**
 * Flag posts shown in the "Latest Repacks" slider (NEW badge + cover repair).
 * @returns {Map<string, {cover: string}>}
 */
function parseCarousel() {
  const links = [...document.querySelectorAll("a")].filter(
    (a) => a.querySelector("img") && /fitgirl-repacks\.site\/[^/]+\/$/.test(a.href)
  );
  const map = new Map();
  for (const a of links) {
    const img = a.querySelector("img");
    const t = (a.title || img?.alt || "").trim();
    if (t && t.length > 3) map.set(a.href, { cover: img.src });
  }
  return map;
}

/**
 * Parse the sidebar "Most Popular Repacks of the Week" widget.
 * Never throws — the widget may be absent on some pages.
 * @returns {PopularEntry[]}
 */
function parsePopular() {
  try {
    const head = [...document.querySelectorAll("h1,h2,h3,h4")].find((e) =>
      FG_RE.popularHeading.test(e.innerText || "")
    );
    if (!head?.parentElement) return [];
    const imgs = [...head.parentElement.querySelectorAll("a img")].slice(0, FG_LIMITS.popularMax);
    const seen = new Set();
    const out = [];
    for (const img of imgs) {
      const a = img.closest("a");
      const href = a?.href || "";
      if (!href || seen.has(href)) continue;
      seen.add(href);
      const title = (img.alt || a?.title || "").trim();
      if (!title) continue;
      out.push({
        rank: out.length + 1,
        title,
        short: title.replace(/\s*[–\-,]\s*v[\d.]+.*$/i, "").trim() || title,
        cover: img.currentSrc || img.src || "",
        url: href,
      });
    }
    return out;
  } catch {
    return [];
  }
}
