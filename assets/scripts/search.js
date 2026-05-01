let currentSearchType = "code";
let currentSearchPage = 1;
let currentSearchQuery = "";

async function loadSearchTab() {
  tabContent.innerHTML = `
    <i class="search-note">Recently commited codes won't display in search results</i>
    <div class="search-container">
        <form id="search-form" class="search-form">
            <select id="search-type">
                <option value="code">Code</option>
                <option value="issues">Issues</option>
                <option value="commits">Commits</option>
            </select>
            <input type="text" id="search-query" placeholder="Search inside this repo..." required>
            <button type="submit" class="btn-prime">Search</button>
        </form>
        <div id="search-results"></div>
    </div>
    `;

  document
    .getElementById("search-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      currentSearchType = document.getElementById("search-type").value;
      currentSearchQuery = document.getElementById("search-query").value.trim();
      currentSearchPage = 1;
      performSearch();
    });
}

async function performSearch() {
  const { owner, repo } = window.currentRepo;
  const resultsDiv = document.getElementById("search-results");
  resultsDiv.innerHTML = '<div class="preloader">Searching...</div>';

  try {
    let data;
    console.log("Search response:", data);
    switch (currentSearchType) {
      case "code":
        data = await searchCode(
          owner,
          repo,
          currentSearchQuery,
          currentSearchPage,
        );
        break;
      case "issues":
        data = await searchIssues(
          owner,
          repo,
          currentSearchQuery,
          currentSearchPage,
        );
        break;
      case "commits":
        data = await searchCommits(
          owner,
          repo,
          currentSearchQuery,
          currentSearchPage,
        );
        break;
    }

    if (data.items && data.items.length > 0) {
      let html = `<p>Found ${data.total_count} results.</p><ul class="search-results-list">`;
      data.items.forEach((item) => {
        if (currentSearchType === "code") {
          html += `
            <li>
                📄 <a href="${item.html_url}" target="_blank">${item.path}</a>
                <span class="search-repo">in ${item.repository.full_name}</span>
            </li>`;
        } else if (currentSearchType === "issues") {
          html += `
            <li>
                🐛 <a href="${item.html_url}" target="_blank">#${item.number} ${item.title}</a>
                <span class="search-state">${item.state}</span>
            </li>`;
        } else if (currentSearchType === "commits") {
          const sha = item.sha.substring(0, 7);
          html += `
        <li>
            🕒 <a href="${item.html_url}" target="_blank">${sha}</a>
            ${item.commit.message.split("\n")[0]}
            <span class="search-author">by ${item.author?.login || item.commit.author.name}</span>
        </li>`;
        }
      });
      html += "</ul>";
      // Pagination
      const totalPages = Math.ceil(data.total_count / 30);
      html += `<div class="pagination">
                <button ${currentSearchPage <= 1 ? "disabled" : ""} onclick="searchPage(${currentSearchPage - 1})">Previous</button>
                <span>Page ${currentSearchPage} of ${totalPages || 1}</span>
                <button ${currentSearchPage >= totalPages ? "disabled" : ""} onclick="searchPage(${currentSearchPage + 1})">Next</button>
            </div>`;
      resultsDiv.innerHTML = html;
    } else {
      resultsDiv.innerHTML = "<p>No results found.</p>";
    }
  } catch (err) {
    resultsDiv.innerHTML = "";
    showError("Search failed");
  }
}

function searchPage(page) {
  currentSearchPage = page;
  performSearch();
}
