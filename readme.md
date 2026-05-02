# 🔍 GitHub Repository Explorer & Downloader

![Made with](https://img.shields.io/badge/made%20with-❤️-red)

A modern, fully-featured GitHub repository viewer built with **PHP**, vanilla **JavaScript**, and the **GitHub REST API**.  
Preview **READMEs**, browse **files** with syntax highlighting, explore **releases**, **branches**, **contributors**, **commits**, **community health**, and even **search inside repos** – all with a clean, responsive interface and **dark/light/system theme** support.

[**Live demo**](http://gitdl.achave.ir/)

---

## ✨ Features

- **Repository overview** – stars, forks, watchers, issues, size, default branch, language, license, topics
- **Language breakdown** – coloured bar + percentage list (filters out <1% languages, uses official GitHub colours)
- **README preview** – full Markdown rendering with:
  - GitHub‑flavoured tables, tasklists, strikethrough
  - Emoji shortcodes (`:tada:` → 🎉) via `markdown-it-emoji`
  - Relative images resolved to `raw.githubusercontent.com`
  - Client‑side caching using `sessionStorage` for instant tab switching
- **File & folder browser**:
  - Lazy‑loaded tree navigation
  - **Filter files by name** with debounced search
  - **Syntax‑highlighted code viewer** (Prism.js + autoloader) for all major languages
  - Image preview for common formats
  - “Back to files” button inside the viewer
- **Releases** – paginated list with **rendered Markdown body**, download assets, and smart link transformations:
  - `@username` mentions become clickable GitHub profile links
  - Full PR URLs (e.g., `https://github.com/owner/repo/pull/4309`) shortened to **`#4309`**
- **Branches** – paginated branch list with links to the latest commit
- **Contributors** – avatars, usernames, and commit counts
- **Recent commits** – last 20 commits with author, date, and click‑through **diff viewer** (unified diff)
- **Community health** badge – health percentage bar + list of community files (code of conduct, contributing guide, license, etc.) with ✅/❌ status
- **Search inside repository** – search for **code**, **issues**, or **commits** with pagination (uses GitHub’s powerful search API)
- **Dynamic tabs** – only tabs with actual content are shown (e.g., no releases → no “Releases” tab)
- **Error toast** – sleek bottom‑sliding notifications replace annoying `alert()` popups
- **Recent repositories** – dropdown with last 10 visited repos (stored in `localStorage`), with “Clear history” option
- **Dark / Light / System theme toggle** – built with CSS custom properties and a **Zinc** colour palette, follows OS preference automatically, choice persisted in `localStorage`
- **Fully RTL & Farsi‑friendly** – entire UI uses `dir="rtl"` and a clean typeface, easily translatable to any language
- **Server‑side caching** – `/info`, `/languages`, and `/readme` responses cached for 10 minutes to reduce API calls

---

## 🛠 Tech Stack

| Layer               | Technology                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Backend             | PHP 7.4+ (no database, simple API proxy)                                                                                          |
| Frontend            | Vanilla JavaScript (ES6+), HTML5, CSS3                                                                                            |
| Markdown rendering  | [markdown-it](https://github.com/markdown-it/markdown-it) + [markdown-it-emoji](https://github.com/markdown-it/markdown-it-emoji) |
| Syntax highlighting | [Prism.js](https://prismjs.com/) with autoloader                                                                                  |
| Caching             | Server‑side file cache + client‑side `sessionStorage`                                                                             |

---

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/chaveamin/gitdl.git
   cd gitdl
   ```

2. **Create a `.env` file** (copy from example)

   ```bash
   cp .env.example .env
   ```

   Open `.env` and set your GitHub personal access token:

   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```

   > **How to get a token:**
   > [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
   > Create one with **no scopes** (public repos only). Classic tokens work best.

3. **Ensure write permissions** for the `cache/` directory (created automatically).

   ```bash
   mkdir cache
   chmod 777 cache   # or appropriate permission for your web server
   ```

4. **Run with a PHP server** (example with PHP built-in server)

   ```bash
   php -S localhost:8000
   ```

   Then open `http://localhost:8000` in your browser.

   For production, place the project in your web server (Apache, Nginx) and **deny access** to `.env` and `cache/` via server rules.

---

## ⚙️ Configuration

You can adjust the **cache TTL** in `api.php` (default: 600 seconds) by changing `$cacheTTL`.

To use a different theme colour scheme, edit `assets/css/theme.css` – the variables are clearly named.

---

## 🔒 Security

- The GitHub token is stored **only** in `.env` and read by `api.php`. It **never** reaches the browser.
- All API requests go through the PHP proxy, so credentials are not exposed.
- The `.env` file and `cache/` directory are excluded from Git (`.gitignore`).
- For production, place `.env` outside the document root or block direct access via `.htaccess` / nginx config.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

Licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.
