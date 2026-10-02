/* FitGirl Reimagined — central configuration.
 * Rule R3: every magic value lives here, never inline in logic.
 * Changing a value here must never require touching another file. */

const FG_HOST = "fitgirl-repacks.site";
const FG_HOME_URL = "https://fitgirl-repacks.site/";

function fgSearchUrl(query) {
  return `https://fitgirl-repacks.site/?s=${encodeURIComponent(query)}`;
}

/** Parse/render budgets. Keep small: pages hold ~10 articles, the rail ~24. */
const FG_LIMITS = {
  genresPerCard: 6,
  /** Genre chips shown on a card (rest are in the details sheet). */
  genresShown: 4,
  /** Description snippet length (chars). */
  descChars: 420,
  /** Minimum paragraph length to qualify as a description. */
  descMinChars: 120,
  popularMax: 24,
  upcomingShown: 30,
  upcomingCap: 60,
  magnetsMax: 6,
  torrentsMax: 6,
  screenshotsMax: 6,
};

/** Sort options, shared by the toolbar dropdown and result labels. */
const FG_SORT_OPTS = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
  { value: "smallest", label: "Smallest repack" },
  { value: "saving", label: "Biggest saving %" },
];

/** Markers used to recognize sections of the source pages. */
const FG_RE = {
  popularHeading: /Most Popular Repacks/i,
  upcomingTitle: /UPCOMING REPACKS/i,
  upcomingBullet: /^[⇢→>]/,
  torrentHost: /1337x|rutor|tapochek|cs\.rin/i,
  /** Cuts a tag list off before the next spec field (some posts omit line breaks). */
  nextSpecField: /Company:|Languages:|Original Size:|Repack Size:/,
};

/** Inline stroke icons (24px grid, currentColor). Use via fgIcon(name). */
const FG_ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  auto: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrowL: '<path d="M15 6l-6 6 6 6"/>',
  arrowR: '<path d="M9 6l6 6-6 6"/>',
};

/** @param {keyof typeof FG_ICON_PATHS} name @returns {string} */
function fgIcon(name) {
  return `<svg class="fg-r-ic" viewBox="0 0 24 24" aria-hidden="true">${FG_ICON_PATHS[name]}</svg>`;
}
