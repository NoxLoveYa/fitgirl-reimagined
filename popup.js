function sync(state) {
  const on = state.fg_enabled !== false;
  document.getElementById("status").textContent = on ? "Active on fitgirl-repacks.site" : "Showing the original site";
  document.getElementById("card").classList.toggle("on-state", on);
  document.getElementById("toggle").setAttribute("aria-checked", String(on));
  document.getElementById("grid")?.classList.toggle("on", (state.fg_view || "grid") === "grid");
  document.getElementById("list")?.classList.toggle("on", state.fg_view === "list");
  const theme = state.fg_theme || "system";
  document.querySelectorAll("[data-theme-opt]").forEach((b) =>
    b.classList.toggle("on", b.dataset.themeOpt === theme)
  );
}
chrome.storage.local.get(["fg_enabled", "fg_view", "fg_theme"], sync);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  chrome.storage.local.get(["fg_enabled", "fg_view", "fg_theme"], sync);
});
document.getElementById("toggle").addEventListener("click", async () => {
  const r = await chrome.storage.local.get(["fg_enabled"]);
  await chrome.storage.local.set({ fg_enabled: r.fg_enabled === false ? true : false });
});
document.getElementById("grid").addEventListener("click", () => chrome.storage.local.set({ fg_view: "grid" }));
document.getElementById("list").addEventListener("click", () => chrome.storage.local.set({ fg_view: "list" }));
document.querySelectorAll("[data-theme-opt]").forEach((b) =>
  b.addEventListener("click", () => chrome.storage.local.set({ fg_theme: b.dataset.themeOpt }))
);
