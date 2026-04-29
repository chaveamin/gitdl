async function apiFetch(endpoint, params = {}) {
  let url = `api.php?endpoint=${encodeURIComponent(endpoint)}`;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  }

  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status}: ${errorText}`);
  }

  if (endpoint === "commit") {
    return res.text();
  }
  return res.json();
}

function fetchRepoInfo(owner, repo) {
  return apiFetch("info", { owner, repo });
}

function fetchLanguages(owner, repo) {
  return apiFetch("languages", { owner, repo });
}

function fetchReadme(owner, repo) {
  return apiFetch("readme", { owner, repo });
}

function fetchContents(owner, repo, path = encodeURIComponent(path)) {
  return apiFetch("contents", { owner, repo, path });
}

function fetchReleases(owner, repo, page = 1, perPage = 5) {
  return apiFetch("releases", { owner, repo, page, per_page: perPage });
}

function fetchBranches(owner, repo, page = 1, perPage = 10) {
  return apiFetch("branches", { owner, repo, page, per_page: perPage });
}

function fetchContributors(owner, repo, page = 1, perPage = 12) {
  return apiFetch("contributors", { owner, repo, page, per_page: perPage });
}

function fetchCommits(owner, repo, page = 1, perPage = 20) {
  return apiFetch("commits", { owner, repo, page, per_page: perPage });
}

function fetchCommitDiff(owner, repo, sha) {
  return apiFetch("commit", { owner, repo, sha });
}
