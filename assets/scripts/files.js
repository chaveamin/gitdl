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

async function browsePath(path = "") {
  const { owner, repo } = window.currentRepo;
  tabContent.classList.remove("hidden");
  tabContent.innerHTML = '<div class="preloader">Browsing...</div>';

  try {
    const data = await fetchContents(owner, repo, path);

    if (!Array.isArray(data)) {
      const parentPath = path.includes("/")
        ? path.substring(0, path.lastIndexOf("/"))
        : "";
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
        html += `<li class="folder" data-path="${item.path}"><svg class="folder-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4418_7957)"><path d="M21.0169 7.99175C21.4148 8.55833 20.9405 9.25 20.2482 9.25H3C2.44772 9.25 2 8.80228 2 8.25V6.42C2 3.98 3.98 2 6.42 2H8.74C10.37 2 10.88 2.53 11.53 3.4L12.93 5.26C13.24 5.67 13.28 5.72 13.86 5.72H16.65C18.4546 5.72 20.0516 6.61709 21.0169 7.99175Z"/><path d="M20.9834 10.75C21.5343 10.75 21.9815 11.1957 21.9834 11.7466L22 16.6503C22 19.6003 19.6 22.0003 16.65 22.0003H7.35C4.4 22.0003 2 19.6003 2 16.6503V11.7503C2 11.198 2.44771 10.7503 2.99999 10.7503L20.9834 10.75Z"/></g><defs><clipPath id="clip0_4418_7957"><rect width="24" height="24"/></clipPath></defs></svg> ${item.name}</li>`;
      } else {
        html += `<li class="file" data-path="${item.path}"><svg class="file-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4418_9699)"><path d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 4.5V6.5C14.5 7.6 15.4 8.5 16.5 8.5H18.5" stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13H12" stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 17H16" stroke-width="1.7" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4418_9699"><rect width="24" height="24" fill="oklch(44.2% 0.017 285.786)"/></clipPath></defs></svg> ${item.name}</li>`;
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
    tabContent.classList.add("hidden");
    showError("Failed to load files");
  }
}
