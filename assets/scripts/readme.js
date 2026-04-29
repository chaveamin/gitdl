async function loadReadme() {
  const { owner, repo } = window.currentRepo;
  tabContent.classList.remove("hidden");
  tabContent.innerHTML = '<div class="preloader">Loading README...</div>';

  try {
    const data = await fetchReadme(owner, repo);

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
