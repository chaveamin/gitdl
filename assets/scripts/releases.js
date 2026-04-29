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

async function loadReleases(page = 1) {
  const { owner, repo } = window.currentRepo;
  try {
    const releases = await fetchReleases(owner, repo, page, 5);
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
    tabContent.classList.add("hidden");
    showError("Failed to load releases");
  }
}
