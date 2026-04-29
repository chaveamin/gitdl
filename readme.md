# 🔍 GitHub Repository Explorer & Downloader

A clean, modern web tool to preview any **public** GitHub repository: browse files, read the README with full Markdown rendering, explore releases, branches, contributors, and download a ZIP archive – all without leaving the page.

---

## ✨ Features

- **Repository overview** – stars, forks, watchers, issues, size, language, license, topics
- **Language breakdown** – coloured bar + percentage list (filters out <1% languages)
- **README preview** – rendered Markdown with:
  - GitHub‑flavoured tables, tasklists, strikethrough
  - Emoji shortcodes (`:tada:` → 🎉)
  - Relative images resolved to `raw.githubusercontent.com`
- **File & folder browser** – lazy‑loaded tree navigation
- **Releases** – paginated list of releases with Markdown body, download assets, **@mention linking** and **shortened pull request references** (`#4309`)
- **Branches** – paginated list with links to commits
- **Contributors** – avatars, usernames, commit counts
- **Dynamic tabs** – only tabs with actual content are shown (e.g., if a repo has no releases, the tab is hidden)
- **Error toast** – sleek bottom‑sliding notifications instead of `alert()` popups
- **Secure backend** – GitHub token stays on the server, never exposed to the frontend

---

## 🛠️ Tech Stack

| Layer    | Technology                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Backend  | PHP 7.4+ (no database, simple API proxy)                                                                                          |
| Frontend | Vanilla JavaScript                                                                                                                |
| Markdown | [markdown-it](https://github.com/markdown-it/markdown-it) + [markdown-it-emoji](https://github.com/markdown-it/markdown-it-emoji) |
| API      | GitHub REST API v3                                                                                                                |

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/chaveamin/gitdl.git
cd gitdl
```

### 2. Create a `.env` file

Copy the example and add your GitHub personal access token:

```bash
cp .env.example .env
```

Open `.env` and set your token:

```
GITHUB_TOKEN=ghp_your_token_here
```

> **How to get a token:**  
> Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens).  
> Generate a new token with nedded scopes.  
> Copy the token.

### 3. Run with a PHP web server

Place the project folder inside your web or local server (Apache, Nginx, XAMPP, etc.) or use the built‑in PHP server:

```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## more features to come...🚜

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
