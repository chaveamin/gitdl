const THEME_KEY = "gitdl-theme";
const SYSTEM_DARK_MQ = window.matchMedia("(prefers-color-scheme: dark)");

function getSystemTheme() {
  return SYSTEM_DARK_MQ.matches ? "dark" : "light";
}

function applyTheme(theme) {
  if (theme === "system") {
    const system = getSystemTheme();
    document.documentElement.setAttribute("data-theme", system);
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

let stored = localStorage.getItem(THEME_KEY) || "system";
applyTheme(stored);

SYSTEM_DARK_MQ.addEventListener("change", (e) => {
  stored = localStorage.getItem(THEME_KEY) || "system";
  if (stored === "system") {
    applyTheme("system");
  }
});

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || "system";
  const next =
    current === "light" ? "dark" : current === "dark" ? "system" : "light";
  saveTheme(next);
  applyTheme(next);
  updateToggleIcon(next);
}

function updateToggleIcon(theme) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  if (theme === "light") {
    btn.innerHTML = "Return to darkness";
    btn.title = "Light";
  } else if (theme === "dark") {
    btn.innerHTML = "Let there be light";
    btn.title = "Dark";
  } else {
    btn.innerHTML = "Automatic";
    btn.title = "System";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const current = localStorage.getItem(THEME_KEY) || "system";
  updateToggleIcon(current);
});
