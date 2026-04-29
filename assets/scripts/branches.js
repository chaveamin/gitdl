async function loadBranches(page = 1) {
  const { owner, repo } = window.currentRepo;
  try {
    const branches = await fetchBranches(owner, repo, page, 10);
    renderPaginatedList("branches", branches, page, loadBranches, (branch) => {
      return `<li>🌿 ${branch.name} (<a href="${branch.commit.url}" target="_blank">commit</a>)</li>`;
    });
  } catch (err) {
    tabContent.classList.add("hidden");
    showError("Failed to load branches");
  }
}
