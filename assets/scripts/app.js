// ---------- Preloader ----------
function showPreloader(show) {
  document.getElementById("preloader").classList.toggle("hidden", !show);
}

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

    const tabsDiv = document.getElementById("tabs");
    tabsDiv.classList.remove("hidden");

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
