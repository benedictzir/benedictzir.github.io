// Runs before styles: stored choices win; otherwise follow the device immediately.
(() => {
  const root = document.documentElement;
  const device = matchMedia("(prefers-color-scheme: dark)");
  let choice = null;
  try {
    const saved = localStorage.getItem("portfolio:theme");
    if (saved === "light" || saved === "dark") choice = saved;
  } catch {}
  function apply() {
    const theme = choice || (device.matches ? "dark" : "light");
    root.dataset.theme = theme;
    root.dataset.themeMode = choice ? "manual" : "system";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#232D3D" : "#FFFEFC");
    document
      .querySelectorAll("picture[data-theme-art] source")
      .forEach((source) => {
        source.media = "all";
        source.srcset = source.dataset[theme];
      });
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.hidden = false;
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      );
      toggle.title =
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }
    const status = document.querySelector("[data-theme-status]");
    if (status)
      status.textContent = `${theme === "dark" ? "Dark" : "Light"} theme. ${choice ? "Your preference is selected." : "Following your device."}`;
  }
  function save(value) {
    choice = value;
    try {
      localStorage.setItem("portfolio:theme", value);
    } catch {}
    apply();
  }
  apply();
  device.addEventListener("change", () => {
    if (!choice) apply();
  });
  document.addEventListener("DOMContentLoaded", () => {
    apply();
    document
      .querySelector("[data-theme-toggle]")
      ?.addEventListener("click", () =>
        save(root.dataset.theme === "dark" ? "light" : "dark"),
      );
  });
})();
