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
