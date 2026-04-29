const tabContent = document.getElementById("tab-content");
tabContent.classList.add("hidden");

// ---------- Error Toast ----------
const errorToast = document.getElementById("error-toast");
const errorToastMsg = document.getElementById("error-toast-msg");
let errorToastTimer = null;

function showError(message, duration = 5000) {
  if (errorToastTimer) clearTimeout(errorToastTimer);
  errorToastMsg.textContent = message;
  errorToast.classList.add("show");
  if (duration > 0) {
    errorToastTimer = setTimeout(() => hideError(), duration);
  }
}

function hideError() {
  errorToast.classList.remove("show");
  if (errorToastTimer) {
    clearTimeout(errorToastTimer);
    errorToastTimer = null;
  }
}

// ---------- Preloader ----------
function showPreloader(show) {
  document.getElementById("preloader").classList.toggle("hidden", !show);
}

// ---------- Language colors ----------
const languageColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  PHP: "#4F5D95",
  Ruby: "#701516",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Shell: "#89e051",
  PowerShell: "#012456",
  R: "#198CE7",
  MATLAB: "#e16737",
  "Objective-C": "#438eff",
  Perl: "#0298c3",
  Lua: "#000080",
  Makefile: "#427819",
  Dockerfile: "#384d54",
  Vue: "#41b883",
  TeX: "#3D6117",
  Markdown: "#083fa1",
  YAML: "#cb171e",
  JSON: "#292929",
  XML: "#0060ac",
  "Jupyter Notebook": "#DA5B0B",
  Default: "#cccccc",
};

// ---------- Markdown‑it configuration ----------
const md = window
  .markdownit({
    html: true,
    typographer: true,
    breaks: true,
    linkify: true,
  })
  .use(window.markdownitEmoji)
  .enable(["table"]);

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
    const [infoRes, langRes] = await Promise.all([
      fetch(`api.php?endpoint=info&owner=${owner}&repo=${repo}`),
      fetch(`api.php?endpoint=languages&owner=${owner}&repo=${repo}`),
    ]);

    if (!infoRes.ok) throw new Error("Repository not found");
    const repoInfo = await infoRes.json();
    const languages = langRes.ok ? await langRes.json() : {};

    renderRepoInfo(repoInfo, languages);
    window.currentRepo = { owner, repo };

    // Show tabs with a loading indicator
    const tabsDiv = document.getElementById("tabs");
    tabsDiv.classList.remove("hidden");

    const available = await checkTabAvailability(owner, repo);
    buildTabs(available);
  } catch (err) {
    showError("Error loading repository data");
    document.getElementById("repo-info").classList.add("hidden");
    tabContent.classList.add("hidden");
    tabContent.innerHTML = "";
  } finally {
    showPreloader(false);
  }
});

// ---------- Tab availability ----------
async function checkTabAvailability(owner, repo) {
  const checks = {
    readme: fetch(`api.php?endpoint=readme&owner=${owner}&repo=${repo}`).then(
      (r) => r.ok,
    ),
    files: fetch(
      `api.php?endpoint=contents&owner=${owner}&repo=${repo}&path=`,
    ).then((r) => r.ok && r.status !== 404),
    releases: fetch(
      `api.php?endpoint=releases&owner=${owner}&repo=${repo}&per_page=1`,
    )
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && data.length > 0),
    branches: fetch(
      `api.php?endpoint=branches&owner=${owner}&repo=${repo}&per_page=1`,
    )
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && data.length > 0),
    contributors: fetch(
      `api.php?endpoint=contributors&owner=${owner}&repo=${repo}&per_page=1`,
    )
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && data.length > 0),

    commits: fetch(
      `api.php?endpoint=commits&owner=${owner}&repo=${repo}&per_page=1`,
    )
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && data.length > 0),
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

// ---------- Tab switching ----------
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
    default:
      break;
  }
}

document.getElementById("tabs").addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    switchTab(e.target.dataset.tab);
  }
});

// Commit click handler
async function showCommitDiff(sha) {
  const { owner, repo } = window.currentRepo;
  try {
    const res = await fetch(
      `api.php?endpoint=commit&owner=${owner}&repo=${repo}&sha=${sha}`,
    );
    if (!res.ok) throw new Error("Failed to load diff");
    const diffText = await res.text();
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

// Language detection
function getLanguageClass(filename) {
  const extension = filename.split(".").pop().toLowerCase();
  const map = {
    js: "javascript",
    ts: "typescript",
    jsx: "jsx",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    php: "php",
    java: "java",
    cs: "csharp",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    go: "go",
    rs: "rust",
    swift: "swift",
    kt: "kotlin",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    markdown: "markdown",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    bat: "batch",
    ps1: "powershell",
    dockerfile: "docker",
    makefile: "makefile",
    txt: "plaintext",
    log: "plaintext",
  };
  return map[extension] || "plaintext";
}

// ---------- README loader ----------
async function loadReadme() {
  const { owner, repo } = window.currentRepo;
  tabContent.classList.remove("hidden");
  tabContent.innerHTML = '<div class="preloader">Loading README...</div>';

  try {
    const res = await fetch(
      `api.php?endpoint=readme&owner=${owner}&repo=${repo}`,
    );
    if (!res.ok) {
      showError("README not found");
      tabContent.innerHTML = "";
      tabContent.classList.add("hidden");
      return;
    }
    const data = await res.json();
    const bytes = Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0));
    const content = new TextDecoder("utf-8").decode(bytes);

    const rawUrl = data.download_url;
    const baseRawUrl = rawUrl.substring(0, rawUrl.lastIndexOf("/") + 1);

    let html = md.render(content);
    html = html.replace(
      /<img\s[^>]*src=(["'])([^"']+)\1/gi,
      (match, quote, src) => {
        if (/^(https?:|\/\/|data:)/i.test(src)) return match;
        const newSrc = baseRawUrl + src.replace(/^\//, "");
        return match.replace(src, newSrc);
      },
    );
    tabContent.innerHTML = html;
  } catch (err) {
    tabContent.classList.add("hidden");
    showError("Failed to load README");
  }
}

// ---------- File / Folder browser ----------
async function browsePath(path = "") {
  const { owner, repo } = window.currentRepo;
  tabContent.classList.remove("hidden");
  tabContent.innerHTML = '<div class="preloader">Browsing...</div>';

  try {
    const res = await fetch(
      `api.php?endpoint=contents&owner=${owner}&repo=${repo}&path=${encodeURIComponent(path)}`,
    );
    if (!res.ok) throw new Error("Failed to fetch contents");
    const data = await res.json();

    if (!Array.isArray(data)) {
      const parentPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';
      // Display images
      const imageExtensions = [
        "png",
        "jpg",
        "jpeg",
        "gif",
        "svg",
        "webp",
        "bmp",
        "ico",
      ];
      const ext = data.name.split(".").pop().toLowerCase();
      if (imageExtensions.includes(ext)) {
        tabContent.innerHTML = `
        <div class="file-viewer">
            <div class="file-header">
                <button class="back-btn" onclick="browsePath('${parentPath}')">Back to files</button>
                <span class="file-name">${data.name}</span>
                <span class="file-size">${(data.size / 1024).toFixed(1)} KB</span>
                <a href="${data.html_url}" target="_blank" class="file-github-link">View on GitHub</a>
            </div>
            <img src="${data.download_url}" alt="${data.name}" style="max-width:100%; max-height:70vh; display:block; margin:0 auto;">
        </div>`;
        return;
      }
      if (data.content && data.encoding === "base64") {
        try {
          const bytes = Uint8Array.from(atob(data.content), (c) =>
            c.charCodeAt(0),
          );
          const content = new TextDecoder("utf-8").decode(bytes);
          const langClass = getLanguageClass(data.name);

          const escaped = escapeHtml(content);

          const pre = document.createElement("pre");
          const code = document.createElement("code");
          code.className = `language-${langClass}`;
          code.textContent = content;
          pre.appendChild(code);

          Prism.highlightElement(code);
          const highlightedHTML = pre.innerHTML;
          tabContent.innerHTML = `
                <div class="file-viewer">
                    <div class="file-header">
                        <button class="back-btn" onclick="browsePath('${parentPath}')">Back to files</button>
                        <span class="file-name">${data.name}</span>
                        <span class="file-size">${(data.size / 1024).toFixed(1)} KB</span>
                        <a href="${data.html_url}" target="_blank" class="file-github-link">View on GitHub</a>
                    </div>
                    <pre class="code-container"><code class="language-${langClass}">${escaped}</code></pre>
                </div>`;

          setTimeout(() => {
            const codeEl = tabContent.querySelector("code");
            if (codeEl) Prism.highlightElement(codeEl);
          }, 0);
          return;
        } catch (err) {}
      }

      tabContent.innerHTML = `
        <div class="file-viewer">
            <div class="file-header">
                <button class="back-btn" onclick="browsePath('${parentPath}')">Back to files</button>
                <span class="file-name">${data.name}</span>
                <span class="file-size">${(data.size / 1024).toFixed(1)} KB</span>
                <a href="${data.html_url}" target="_blank" class="file-github-link">View on GitHub</a>
            </div>
            <p class="file-not-available">File content cannot be displayed inline. <a href="${data.html_url}" target="_blank">Open on GitHub</a>.</p>
        </div>`;
      return;
    }

    let html = `<ul class="file-tree">`;
    if (path) {
      const parentPath = path.substring(
        0,
        path.lastIndexOf("/") > -1 ? path.lastIndexOf("/") : 0,
      );
      html += `<li class="folder" data-path="${parentPath}">📁 ..</li>`;
    }
    data.forEach((item) => {
      if (item.type === "dir") {
        html += `<li class="folder" data-path="${item.path}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4418_7957)"><path d="M21.0169 7.99175C21.4148 8.55833 20.9405 9.25 20.2482 9.25H3C2.44772 9.25 2 8.80228 2 8.25V6.42C2 3.98 3.98 2 6.42 2H8.74C10.37 2 10.88 2.53 11.53 3.4L12.93 5.26C13.24 5.67 13.28 5.72 13.86 5.72H16.65C18.4546 5.72 20.0516 6.61709 21.0169 7.99175Z" fill="oklch(27.4% 0.006 286.033)"/><path d="M20.9834 10.75C21.5343 10.75 21.9815 11.1957 21.9834 11.7466L22 16.6503C22 19.6003 19.6 22.0003 16.65 22.0003H7.35C4.4 22.0003 2 19.6003 2 16.6503V11.7503C2 11.198 2.44771 10.7503 2.99999 10.7503L20.9834 10.75Z" fill="oklch(27.4% 0.006 286.033)"/></g><defs><clipPath id="clip0_4418_7957"><rect width="24" height="24" fill="oklch(27.4% 0.006 286.033)"/></clipPath></defs></svg> ${item.name}</li>`;
      } else {
        html += `<li class="file" data-path="${item.path}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4418_9699)"><path d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="oklch(44.2% 0.017 285.786)" stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 4.5V6.5C14.5 7.6 15.4 8.5 16.5 8.5H18.5" stroke="oklch(44.2% 0.017 285.786)" stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13H12" stroke="oklch(44.2% 0.017 285.786)" stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 17H16" stroke="oklch(44.2% 0.017 285.786)" stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4418_9699"><rect width="24" height="24" fill="oklch(44.2% 0.017 285.786)"/></clipPath></defs></svg> ${item.name}</li>`;
      }
    });
    html += "</ul>";
    tabContent.innerHTML = html;

    document.querySelectorAll(".folder").forEach((el) => {
      el.addEventListener("click", () => browsePath(el.dataset.path));
    });
    document.querySelectorAll(".file").forEach((el) => {
      el.addEventListener("click", () => browsePath(el.dataset.path));
    });
  } catch (err) {
    tabContent.innerHTML = '<p class="error">Failed to load files.</p>';
    showError("Failed to load files");
  }
}

// ---------- Branches ----------
async function loadBranches(page = 1) {
  const { owner, repo } = window.currentRepo;
  try {
    const res = await fetch(
      `api.php?endpoint=branches&owner=${owner}&repo=${repo}&page=${page}&per_page=10`,
    );
    if (!res.ok) throw new Error("Failed to fetch branches");
    const branches = await res.json();
    renderPaginatedList("branches", branches, page, loadBranches, (branch) => {
      return `<li>🌿 ${branch.name} (<a href="${branch.commit.url}" target="_blank">commit</a>)</li>`;
    });
  } catch (err) {
    tabContent.innerHTML = '<p class="error">Failed to load branches.</p>';
    showError("Failed to load branches");
  }
}

// ---------- Release body ----------
function enhanceReleaseBody(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Convert @mentions to links
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((textNode) => {
    const text = textNode.textContent;
    const mentionRegex =
      /(^|\s)@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?)/g;

    if (!mentionRegex.test(text)) return;
    mentionRegex.lastIndex = 0;

    let newHtml = text;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const prefix = match[1];
      const username = match[2];
      const replacement = `${prefix}<a href="https://github.com/${username}" target="_blank">@${username}</a>`;
      newHtml =
        newHtml.slice(0, match.index) +
        replacement +
        newHtml.slice(match.index + match[0].length);
      match.index += replacement.length - match[0].length;
      mentionRegex.lastIndex = match.index + replacement.length;
    }

    if (newHtml !== text) {
      const span = doc.createElement("span");
      span.innerHTML = newHtml;
      textNode.parentNode.replaceChild(span, textNode);
      while (span.firstChild) {
        span.parentNode.insertBefore(span.firstChild, span);
      }
      span.remove();
    }
  });

  // Shorten PR links that show the full URL
  const allLinks = doc.querySelectorAll("a");
  allLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const prMatch = href.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/,
    );
    if (prMatch) {
      const prNumber = prMatch[3];
      const linkText = link.textContent.trim();
      if (linkText === href) {
        link.textContent = `#${prNumber}`;
      }
    }
  });

  return doc.body.innerHTML;
}

// ---------- Releases ----------
async function loadReleases(page = 1) {
  const { owner, repo } = window.currentRepo;
  try {
    const res = await fetch(
      `api.php?endpoint=releases&owner=${owner}&repo=${repo}&page=${page}&per_page=5`,
    );
    if (!res.ok) throw new Error("Failed to fetch releases");
    const releases = await res.json();
    renderPaginatedList("releases", releases, page, loadReleases, (release) => {
      let assets = "";
      release.assets.forEach((asset) => {
        assets += `<a href="${asset.browser_download_url}" class="download-btn" target="_blank">${asset.name}</a> `;
      });

      let bodyHtml = "";
      if (release.body) {
        const renderedMd = md.render(release.body);
        bodyHtml = `<div class="release-body">${enhanceReleaseBody(renderedMd)}</div>`;
      }

      return `<li class="release-item">
        <strong class="release-tag">${release.tag_name}</strong>
        <span class="release-date">${new Date(release.published_at).toDateString()}</span>
        ${bodyHtml}
        <div class="release-assets">${assets}</div>
    </li>`;
    });
  } catch (err) {
    tabContent.innerHTML = '<p class="error">Failed to load releases.</p>';
    showError("Failed to load releases");
  }
}

// ---------- Contributors ----------
async function loadContributors(page = 1) {
  const { owner, repo } = window.currentRepo;
  try {
    const res = await fetch(
      `api.php?endpoint=contributors&owner=${owner}&repo=${repo}&page=${page}&per_page=12`,
    );
    if (!res.ok) throw new Error("Failed to fetch contributors");
    const contributors = await res.json();
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
    tabContent.innerHTML = '<p class="error">Failed to load contributors.</p>';
    showError("Failed to load contributors");
  }
}

// ---------- Commits ----------
async function loadCommits(page = 1) {
  const { owner, repo } = window.currentRepo;
  try {
    const res = await fetch(
      `api.php?endpoint=commits&owner=${owner}&repo=${repo}&page=${page}&per_page=20`,
    );
    if (!res.ok) throw new Error("Failed to fetch commits");
    const commits = await res.json();
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
    tabContent.innerHTML = '<p class="error">Failed to load commits.</p>';
    showError("Failed to load commits");
  }
}

// ---------- Pagination helper ----------
function renderPaginatedList(type, items, page, loadFn, itemRenderer) {
  let html = `<ul class="${type}-list">`;
  items.forEach((item) => (html += itemRenderer(item)));
  html += "</ul>";

  html += `<div class="pagination">
        <button ${page <= 1 ? "disabled" : ""} onclick="${loadFn.name}(${page - 1})">Previous</button>
        <span>Page ${page}</span>
        <button onclick="${loadFn.name}(${page + 1})">Next</button>
    </div>`;
  tabContent.innerHTML = html;
}

// ---------- Render repo info ----------
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
