# 💻 Prajan Karthik — Terminal Portfolio Website

![Astro](https://img.shields.io/badge/Astro-7.0.6-orange?style=flat-square&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue?style=flat-square&logo=typescript)
![UI Aesthetic](https://img.shields.io/badge/Aesthetic-Linux%20Terminal-green?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-Node.js%20Native%20Runner-brightgreen?style=flat-square)

Welcome to my interactive terminal corner of the internet! A Modern-CLI styled portfolio designed to give you a fun glimpse into who I am, my tech stack, and the projects I enjoy building. Powered by **Astro 7**, **TypeScript**, and a custom **vanilla JavaScript terminal emulator**.

---

## 📌 Index

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Interactive Terminal Commands](#-interactive-terminal-commands)
- [How Projects Get on the Site](#-how-projects-get-on-the-site)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## ✨ Key Features

* **⌨️ Interactive Terminal Emulator:** Built from scratch (`src/lib/terminal.js`) with support for:
  * **Command Registry:** `aboutme`, `projects`, `social`, `email`, `history`, `help`, `clear`, and `exit`.
  * **Typewriter Boot Sequence:** Auto-executes `help` command on launch.
  * **History & Autocomplete:** Up/Down arrow history navigation and `Tab` auto-completion.
  * **Window Management:** Working minimize/maximize title bar controls.
  * **Shutdown & Reconnect:** Simulated Linux broadcast shutdown sequence and session reconnect overlay.
* **🤖 Automatic Project Sync:** A daily GitHub Action reads your pinned repos, works out tech stack and status, has Claude Code summarise any README that changed, and opens a PR updating `src/data/projects.json`. The terminal `projects` command and the `/projects` page both read that one file.
* **🛡️ Rate Limiting Engine:**
  * Custom rate limiter (`src/lib/rateLimit.mjs`) protecting API calls and the contact form.
* **📬 Contact Form:** Integrated with [Formspree](https://formspree.io/) along with dynamic status handlers.
* **🎨 Modern Terminal Aesthetics:** Dark theme, sharp borders, JetBrains Mono font, and Tux Linux brand iconography.
* **🧪 Automated Test Suite:** Unit testing using Node.js's native test runner for rate limiting and the project sync.

---

## 🛠️ Tech Stack

* **Framework:** [Astro 7](https://astro.build/) (`@astrojs/mdx`)
* **Languages:** TypeScript, JavaScript (ESM)
* **Styling:** Custom CSS Variables, Flexbox, CSS Grid, CSS Animations
* **API & Integrations:** GitHub REST + GraphQL API, Claude Code GitHub Action, Formspree
* **Testing:** Node.js Native Test Runner (`node --test`)
* **Environment Management:** Node.js v20+ / `fnm`

---

## 💻 Interactive Terminal Commands

When visiting the homepage, you can interact with the terminal prompt:

| Command | Description |
| :--- | :--- |
| `help` | Displays available commands and usage hints |
| `aboutme` | Prints full bio, current role, and tech stack overview |
| `projects` | Renders a list of featured projects with status and links |
| `social` | Displays links to GitHub, LinkedIn, and Email |
| `email` | Triggers mail client launcher |
| `history` | Views chronological command history for the session |
| `clear` | Clears terminal screen output |
| `exit` | Triggers Linux-style shutdown sequence and overlay |

---

## 🤖 How Projects Get on the Site

Projects are never hardcoded. They come from GitHub:

1. **Pin a repo** on your GitHub profile (or add the `portfolio` topic to it). That's the only step.
2. Every day, `.github/workflows/sync-projects.yml` runs:
   * `scripts/sync-projects.mjs prepare` fetches the repos, detects the tech stack (languages + `package.json` / `Cargo.toml` / `requirements.txt` / `pyproject.toml` / `go.mod`) and the status (release → *Shipped ✓*, website → *Live*, pushed in the last 90 days → *Active*, otherwise *Paused*).
   * Only if a README changed, **Claude Code** (on your Pro plan) reads it and returns a name, summary and "why it matters". It can read files but not edit anything.
   * `finalize` checks those blurbs and merges them in, the site build is checked, and a PR **"Update portfolio projects"** is opened.
3. **Review and merge the PR.** Vercel deploys it.

Run it anytime from **Actions → Sync Portfolio Projects → Run workflow**. Unpinning a repo removes it on the next sync. Forks, archived and private repos are never listed.

### Fixing something by hand

Don't edit `src/data/projects.json`, because the next sync overwrites it. Add the correction to `src/data/overrides.yml`, keyed by repo name:

```yaml
my-repo:
  name: My Project
  status: Pre-launch (~90%)
  summary: One line that replaces the AI summary.
  hidden: true   # keep it pinned on GitHub but off the site
```

### One-time setup

1. Install [Claude Code](https://claude.ai/code), sign in with your Claude Pro/Max account, and run `claude setup-token`.
2. **Settings → Secrets and variables → Actions:** add the token as `CLAUDE_CODE_OAUTH_TOKEN`.
3. **Settings → Actions → General → Workflow permissions:** tick *Allow GitHub Actions to create and approve pull requests*.
4. Optional: to include private or organisation repos the built-in token can't see, add a fine-grained personal access token (read-only *Contents* + *Metadata*) as `PORTFOLIO_GITHUB_TOKEN`.

### Running the sync locally

```bash
GITHUB_TOKEN=<token> GITHUB_USERNAME=<you> node scripts/sync-projects.mjs prepare
```

This refreshes `src/data/projects.json` and writes any READMEs that need summaries to `.sync/readmes/`.

---

## 🚀 Getting Started

### Prerequisites

* Node.js v20.0.0 or higher.
* `npm` v10+

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/user1043/PortfolioWebsite.git
   cd PortfolioWebsite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_SITE_URL=https://yourwebsite.com # used by astro.js to generate canonical URLs and RSS feed.
   ```

---

## ⚡ Available Scripts

* **`npm run dev`** — Starts the local Astro development server at `http://localhost:4321`
* **`npm run build`** — Builds production-ready static output into `dist/`
* **`npm run preview`** — Preview the production build locally
* **`npm test`** — Runs unit tests using Node's native test runner (`node --test tests/**/*.test.mjs`)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

