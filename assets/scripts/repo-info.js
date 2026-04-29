function renderRepoInfo(info, languages) {
  const div = document.getElementById("repo-info");
  div.classList.remove("hidden");

  let langHtml = "";
  if (languages && Object.keys(languages).length) {
    const total = Object.values(languages).reduce((a, b) => a + b, 0);
    const langEntries = Object.entries(languages)
      .map(([lang, bytes]) => ({ lang, bytes, percent: (bytes / total) * 100 }))
      .filter((entry) => entry.percent >= 1.0)
      .sort((a, b) => b.bytes - a.bytes);

    if (langEntries.length > 0) {
      let barSegments = "";
      langEntries.forEach((entry) => {
        const color = languageColors[entry.lang] || languageColors["Default"];
        const displayPercent = entry.percent.toFixed(1);
        barSegments += `<span style="width:${entry.percent}%;background:${color};" title="${entry.lang}: ${displayPercent}%"></span>`;
      });

      let listItems = "";
      langEntries.forEach((entry) => {
        listItems += `
          <li>
            <span class="lang-color-dot" style="background:${languageColors[entry.lang] || languageColors["Default"]};"></span>
            <span>${entry.lang}</span>
            <span class="lang-percent">${entry.percent.toFixed(1)}%</span>
          </li>`;
      });

      langHtml = `
        <div class="language-bar">${barSegments}</div>
        <ul class="language-list">${listItems}</ul>`;
    }
  }

  div.innerHTML = `
    <h2>${info.full_name}</h2>
    <p>${info.description || ""}</p>
    <div class="repo-stats">
      <span>⭐ ${info.stargazers_count.toLocaleString()}</span>
      <span>🍴 ${info.forks_count.toLocaleString()}</span>
      <span>👀 ${info.subscribers_count || "0"}</span>
      <span>🐛 ${info.open_issues_count.toLocaleString()}</span>
      <span>📦 ${(info.size / 1024).toFixed(1)} MB</span>
      <span>🌿 ${info.default_branch}</span>
      <span>🔤 ${info.language || "N/A"}</span>
      <span>📜 ${info.license ? info.license.spdx_id : "None"}</span>
      <span>🏷️ ${info.topics ? info.topics.join(", ") : "-"}</span>
    </div>
    ${langHtml}
    <a href="${info.html_url}/archive/${info.default_branch}.zip" class="download-btn btn-prime" target="_blank">Download ZIP</a>
  `;
}
