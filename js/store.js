/* FitGirl Reimagined — overlay state + persistence.
 * Rule R6: state is the only mutable shared data. Storage keys are versioned
 * user data: renaming a key orphans stored prefs, so keys change only with
 * a migration note in CHANGELOG.md.
 */

/**
 * @typedef {Object} OverlayState
 * @property {boolean} enabled
 * @property {string} query
 * @property {string} sort
 * @property {string} genre
 * @property {string} view
 * @property {boolean} showUpcoming
 * @property {boolean} showPopular
 * @property {boolean} onlyFavs
 * @property {"system"|"light"|"dark"} theme
 * @property {Set<string>} favs
 * @property {import("./parse.js").RepackItem[]} items
 * @property {string[]} upcoming
 * @property {import("./parse.js").PopularEntry[]} popular
 * @property {string} siteQuery
 * @property {string[]} allGenres
 */

/** @returns {OverlayState} */
function createState() {
  return {
    enabled: true,
    query: "",
    sort: "newest",
    genre: "all",
    view: "grid",
    showUpcoming: true,
    showPopular: true,
    onlyFavs: false,
    theme: "system",
    favs: new Set(),
    items: [],
    upcoming: [],
    popular: [],
    siteQuery: "",
    allGenres: [],
  };
}

/** The single state instance. Read/written by shell, render and sheet. */
let state = createState();

/**
 * Load persisted prefs, then continue boot.
 * @param {() => void} done
 */
function loadState(done) {
  chrome.storage?.local.get(["fg_enabled", "fg_favs", "fg_view", "fg_theme"], (r) => {
    if (r.fg_enabled === false) state.enabled = false;
    if (Array.isArray(r.fg_favs)) state.favs = new Set(r.fg_favs);
    if (r.fg_view) state.view = r.fg_view;
    if (["system", "light", "dark"].includes(r.fg_theme)) state.theme = r.fg_theme;
    done();
  });
}

function persist() {
  chrome.storage?.local.set({
    fg_enabled: state.enabled,
    fg_favs: [...state.favs],
    fg_view: state.view,
    fg_theme: state.theme,
  });
}
