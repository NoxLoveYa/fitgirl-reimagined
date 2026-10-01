/* FitGirl Reimagined — pure helpers. Rule R4: no DOM, no state, no I/O here. */

/**
 * Escape a string for interpolation into HTML.
 * @param {unknown} s
 * @returns {string}
 */
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/**
 * Parse "13.1 GB" / "830 MB" into gigabytes.
 * @param {string|null} s
 * @returns {number|null}
 */
function gbToNum(s) {
  if (!s) return null;
  const m = s.replace(",", ".").match(/([\d.]+)\s*(GB|MB)/i);
  if (!m) return null;
  let v = parseFloat(m[1]);
  if (/MB/i.test(m[2])) v = v / 1024;
  return v;
}

/**
 * Normalize post URLs for comparison (trailing slash is inconsistent).
 * @param {string} u
 * @returns {string}
 */
function normUrl(u) {
  return (u || "").replace(/\/$/, "");
}
