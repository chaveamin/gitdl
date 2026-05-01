// ---------- Globals ----------
window.currentRepo = null;
const RECENT_REPOS_KEY = "gitdl-recent";
const MAX_RECENT = 10;

// ---------- Preloader ----------
function showPreloader(show) {
  document.getElementById("preloader").classList.toggle("hidden", !show);
}

// ---------- Recent Repositories ----------
function loadRecentRepos() {
  const select = document.getElementById("recent-repos-select");
  if (!select) return;

  const stored = localStorage.getItem(RECENT_REPOS_KEY);
  const repos = stored ? JSON.parse(stored) : [];

  while (select.options.length > 1) {
    select.remove(1);
  }

  repos.forEach((repo) => {
    const option = document.createElement("option");
    option.value = repo.url;
    option.textContent = repo.name;
    select.appendChild(option);
  });

  if (repos.length > 0) {
    const clearOption = document.createElement("option");
    clearOption.value = "__clear__";
    clearOption.textContent = "🗑️ Clear history";
    clearOption.style.color = "var(--error-text)";
    select.appendChild(clearOption);
  }
}

function saveRecentRepo(url, fullName) {
  const stored = localStorage.getItem(RECENT_REPOS_KEY);
  let repos = stored ? JSON.parse(stored) : [];

  repos = repos.filter((r) => r.url !== url);

  repos.unshift({ url, name: fullName, time: Date.now() });

  repos = repos.slice(0, MAX_RECENT);

  localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(repos));
  loadRecentRepos();
}

document.addEventListener("DOMContentLoaded", () => {
  loadRecentRepos();

  const select = document.getElementById("recent-repos-select");
  if (select) {
    select.addEventListener("change", (e) => {
      const value = e.target.value;
      if (value === "__clear__") {
        localStorage.removeItem(RECENT_REPOS_KEY);
        loadRecentRepos();
        select.value = "";
        return;
      }
      if (value) {
        document.getElementById("repo_url").value = value;
        document.getElementById("repo-form").dispatchEvent(new Event("submit"));
      }
    });
  }
});

// ---------- Form submit ----------
document.getElementById("repo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = document.getElementById("repo_url").value.trim();
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
  if (!match) {
    showError("Invalid GitHub URL");
    return;
  }

  const owner = match[1];
  const repo = match[2];
  showPreloader(true);

  const tabsDiv = document.getElementById("tabs");

  try {
    const [repoInfo, languagesResult] = await Promise.all([
      fetchRepoInfo(owner, repo),
      fetchLanguages(owner, repo).catch(() => ({})),
    ]);
    const languages =
      languagesResult && typeof languagesResult === "object"
        ? languagesResult
        : {};

    renderRepoInfo(repoInfo, languages);
    window.currentRepo = { owner, repo };
    saveRecentRepo(`https://github.com/${owner}/${repo}`, repoInfo.full_name);

    tabsDiv.classList.remove("hidden");
    tabsDiv.innerHTML = '<div class="preloader">Checking content...</div>';

    const available = await checkTabAvailability(owner, repo);
    buildTabs(available);
  } catch (err) {
    showError("Error loading repository data");
    document.getElementById("repo-info").classList.add("hidden");
    tabsDiv.classList.add("hidden");
    tabContent.classList.add("hidden");
  } finally {
    showPreloader(false);
  }
});
