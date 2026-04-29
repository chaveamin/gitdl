async function loadContributors(page = 1) {
  const { owner, repo } = window.currentRepo;
  try {
    const contributors = await fetchContributors(owner, repo, page, 12);
    renderPaginatedList(
      "contributors",
      contributors,
      page,
      loadContributors,
      (contrib) => {
        return `<li>
              <img class="contributor-img" src="${contrib.avatar_url}" alt="contributor">
              <a class="contributor-link" href="${contrib.html_url}" target="_blank">${contrib.login}</a> (${contrib.contributions} commits)
            </li>`;
      },
    );
  } catch (err) {
    tabContent.classList.add("hidden");
    showError("Failed to load contributors");
  }
}
