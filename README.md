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
* **🐙 GitHub API Integration & Cache:**
  * Dynamically fetches user repositories tagged with `portfolio` using the GitHub REST API (`src/lib/github.js`).
  * Parallel README fetching with rate-limiting backoff.
  * Local 24-hour disk caching (`repos-cache.json`) for instant page loads and offline fallback.
* **🛡️ Rate Limiting Engine:**
  * Custom rate limiter (`src/lib/rateLimit.mjs`) protecting API calls and the contact form.
* **📬 Contact Form:** Integrated with [Formspree](https://formspree.io/) along with dynamic status handlers.
* **🎨 Modern Terminal Aesthetics:** Dark theme, sharp borders, JetBrains Mono font, and Tux Linux brand iconography.
* **🧪 Automated Test Suite:** Unit testing using Node.js's native test runner for rate limiting and GitHub caching logic.

---

## 🛠️ Tech Stack

* **Framework:** [Astro 7](https://astro.build/) (`@astrojs/mdx`)
* **Languages:** TypeScript, JavaScript (ESM)
* **Styling:** Custom CSS Variables, Flexbox, CSS Grid, CSS Animations
* **API & Integrations:** GitHub REST API, Formspree
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

3. **Configure Environment Variables (Optional for live GitHub fetching):**
   Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_USERNAME=your_github_username
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

