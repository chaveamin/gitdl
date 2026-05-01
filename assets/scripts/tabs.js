tabContent.classList.add("hidden");

function switchTab(tabName) {
  document
    .querySelectorAll("#tabs .tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`#tabs [data-tab="${tabName}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  switch (tabName) {
    case "readme":
      loadReadme();
      break;
    case "files":
      browsePath("");
      break;
    case "releases":
      loadReleases();
      break;
    case "branches":
      loadBranches();
      break;
    case "contributors":
      loadContributors();
      break;
    case "commits":
      loadCommits();
      break;
    case "community":
      loadCommunity();
      break;
    case "search":
      loadSearchTab();
      break;
    default:
      break;
  }
}

document.getElementById("tabs").addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    switchTab(e.target.dataset.tab);
  }
});

function buildTabs(availableTabs) {
  const tabsContainer = document.getElementById("tabs");
  tabsContainer.innerHTML = "";

  const tabDefinitions = [
    { key: "readme", label: "📄 README" },
    { key: "files", label: "📁 Files" },
    { key: "releases", label: "🏷️ Releases" },
    { key: "branches", label: "🌿 Branches" },
    { key: "contributors", label: "👥 Contributors" },
    { key: "commits", label: "🕒 Commits" },
    { key: "community", label: "🏥 Community" },
    { key: "search", label: "🔍 Search" },
  ];

  let firstAvailable = null;
  tabDefinitions.forEach((def) => {
    if (availableTabs[def.key]) {
      const btn = document.createElement("button");
      btn.dataset.tab = def.key;
      btn.className = "tab-btn";
      btn.textContent = def.label;
      tabsContainer.appendChild(btn);
      if (!firstAvailable) firstAvailable = def.key;
    }
  });

  if (firstAvailable) {
    switchTab(firstAvailable);
  } else {
    tabContent.innerHTML = "";
    showError("This repository has no viewable content");
  }
}

async function checkTabAvailability(owner, repo) {
  const checks = {
    readme: fetchReadme(owner, repo)
      .then(() => true)
      .catch(() => false),

    files: fetchContents(owner, repo, "")
      .then(() => true)
      .catch(() => false),

    releases: fetchReleases(owner, repo, 1, 1)
      .then((data) => Array.isArray(data) && data.length > 0)
      .catch(() => false),

    branches: fetchBranches(owner, repo, 1, 1)
      .then((data) => Array.isArray(data) && data.length > 0)
      .catch(() => false),

    contributors: fetchContributors(owner, repo, 1, 1)
      .then((data) => Array.isArray(data) && data.length > 0)
      .catch(() => false),

    commits: fetchCommits(owner, repo, 1, 1)
      .then((data) => Array.isArray(data) && data.length > 0)
      .catch(() => false),

    community: fetchCommunityProfile(owner, repo)
      .then(() => true)
      .catch(() => false),

    search: Promise.resolve(true),
  };

  const results = {};
  for (const [tab, promise] of Object.entries(checks)) {
    try {
      results[tab] = await promise;
    } catch {
      results[tab] = false;
    }
  }
  return results;
}
