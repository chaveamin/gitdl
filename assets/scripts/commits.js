async function loadCommits(page = 1) {
  const { owner, repo } = window.currentRepo;
  try {
    const commits = await fetchCommits(owner, repo, page, 20);
    renderPaginatedList("commits", commits, page, loadCommits, (commit) => {
      const author = commit.author
        ? commit.author.login
        : commit.commit.author.name;
      const avatar = commit.author ? commit.author.avatar_url : "";
      const date = new Date(commit.commit.author.date).toLocaleString();
      const message = commit.commit.message.split("\n")[0];
      const shaShort = commit.sha.substring(0, 7);
      return `<li class="commit-item">
                <img src="${avatar}" width="24" alt="" class="commit-avatar" onerror="this.style.display='none'">
                <span class="commit-sha" data-sha="${commit.sha}" title="Click to view diff">${shaShort}</span>
                <span class="commit-message">${message}</span>
                <span class="commit-author">by <a target="_blank" href="https://github.com/${author}">${author}</a></span>
                <span class="commit-date">${date}</span>
            </li>`;
    });
  } catch (err) {
    tabContent.classList.add("hidden");
    showError("Failed to load commits");
  }
}

async function showCommitDiff(sha) {
  const { owner, repo } = window.currentRepo;
  try {
    const diffText = await fetchCommitDiff(owner, repo, sha);
    const modal = document.createElement("div");
    modal.className = "diff-modal";
    modal.innerHTML = `
            <div class="diff-modal-content">
                <span class="diff-close">&times;</span>
                <pre class="diff-view">${escapeHtml(diffText)}</pre>
            </div>`;
    document.body.appendChild(modal);
    modal
      .querySelector(".diff-close")
      .addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  } catch (err) {
    showError("Failed to load diff");
  }
}

document.getElementById("tab-content").addEventListener("click", (e) => {
  const shaEl = e.target.closest(".commit-sha");
  if (shaEl) {
    showCommitDiff(shaEl.dataset.sha);
  }
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
