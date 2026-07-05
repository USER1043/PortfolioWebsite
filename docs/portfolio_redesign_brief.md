# Portfolio Redesign Brief: Terminal Aesthetic

## Vision
Transform the portfolio into a terminal-inspired site with a Pokemon sprite-based aesthetic. The design should feel like a custom Linux system monitor/dashboard, maintaining technical authenticity while being visually distinctive.

## Reference Aesthetic
- **Visual**: Pokemon sprite (pixel art) + terminal info display (see attached image)
- **Color Palette**:
  - Background: `#161320` (dark, near-black)
  - Primary accent: `#2DD4BF` (cyan/teal, used for highlights and links)
  - Secondary accents: `#FF5555` (red), `#FFFF55` (yellow), `#55FF55` (green) — use sparingly for status/icons
  - Text: `#E8E8E8` (off-white/light gray)
  - Borders: `#404040` (dark gray)

- **Typography**:
  - Headings & Code: JetBrainsMono Nerd Font (monospace)
  - Body text: IBM Plex Mono or Courier Prime (monospace, keep it all terminal-like)

- **UI Style**:
  - Borders: Sharp, no rounded corners (terminal aesthetic)
  - Layout: Grid/panels styled like terminal windows or system info boxes
  - Icons: Use Nerd Font icons (⚙, 📦, 🔗, etc.)

---

## Current Site Structure
**Homepage:**
- Brief introduction + navigation
- Links to projects, about, contact

**Existing Projects:**
1. **Jobify** (MERN stack)
   - Job aggregation platform
   - Scrapers for 27 companies
   - Redux state management, JWT auth, Puppeteer
   - Key architectural decisions: config-driven scraper, worker pool, ScraperStatus collection pattern

2. **Redrob** (IndiaRuns Hackathon)
   - Candidate ranking pipeline
   - Constraints: CPU-only, 16GB RAM, 5-minute execution limit
   - Key decision: no external LLM APIs, custom ranking logic

3. **PasswordPal** (Rust/Tauri)
   - Desktop password manager
   - Cross-platform

4. **MediStock** (MERN + RAG + LSTM)
   - Medical inventory system
   - ML integration

5. **Sensory Safari**
   - [Details to be added]

---

## Redesign Scope

### 0. **Avatar / Pokemon ASCII Art**

Display a colored ASCII art Pokemon using `pokemon-colorscripts`.

**Setup:**
1. Run the command to extract the Charizard ASCII art:
   ```bash
   pokemon-colorscripts -n charizard
   ```
   This outputs the colored ASCII art for Charizard.

2. Convert ANSI color codes to CSS classes:
   - ANSI Red (`#FF5555`) → `class="text-red"`
   - ANSI Yellow (`#FFFF55`) → `class="text-yellow"`
   - ANSI Cyan (`#2DD4BF`) → `class="text-cyan"`
   - ANSI Green (`#55FF55`) → `class="text-green"`
   - Dark/Empty spaces → keep as-is or `class="text-bg"` (blends with background)

3. Wrap the converted ASCII art in an HTML `<pre>` block with `font-family: 'JetBrainsMono Nerd Font'`

4. Center it on the homepage above the hostname section

**Result:** Colored ASCII art Charizard matching the terminal aesthetic and color palette.

**Example HTML structure:**
```html
<pre class="pokemon-ascii">
  <span class="text-yellow">⠀⠀⠀████████⠀⠀⠀</span>
  <span class="text-red">⠀████████████████⠀</span>
  <!-- ... rest of ASCII art with color spans -->
</pre>
```

**CSS:**
```css
.pokemon-ascii {
  font-family: 'JetBrainsMono Nerd Font', monospace;
  font-size: 1rem;
  line-height: 1;
  color: var(--text);
  text-align: center;
  margin-bottom: 2rem;
}

.pokemon-ascii .text-red { color: var(--red); }
.pokemon-ascii .text-yellow { color: var(--yellow); }
.pokemon-ascii .text-cyan { color: var(--accent); }
.pokemon-ascii .text-green { color: var(--green); }
```

---

### 1. **Homepage**
Structure:
```
┌────────────────────────────────────────┐
│ prajan-karthik@prajan-83dx             │
│                                        │
│ ⚙  Linux 7.0.14-arch1-1                │
│ 📦 Arch Linux, Hyprland 0.55           │
│ 💻 CS Undergrad + Intel IoT Club       │
│ 🎯 Full-stack engineer, DSA, Linux    │
│                                        │
│ $ ls projects/                         │
│ > jobify/  redrob/  passwordpal/ ...  │
│                                        │
│ $ whoami                               │
│ > [Brief bio here]                     │
└────────────────────────────────────────┘
```

**Elements:**
- Header: Username/hostname (prajan-karthik@prajan-83dx)
- System info section (OS, tools, uptime, RAM usage — can be real or stylized)
- Navigation via command-like prompts (`$ ls projects`, `$ cat about.txt`, etc.)
- Subtle animation on load (like a terminal boot sequence)

### 2. **Project Pages**
Each project should have:

**Header Panel:**
```
┌─────────────────────────────────────┐
│ [PROJECT NAME]                      │
│ Status: [Active/Completed]          │
├─────────────────────────────────────┤
│ Tech: [Stack]                       │
│ Repo: [Link]  Demo: [Link]          │
└─────────────────────────────────────┘
```

**Content Structure:**
1. **Problem Statement** — What was hard? What constraint existed?
2. **Architecture Diagram** — Can be:
   - ASCII art (for terminal feel)
   - SVG diagram (for clarity)
   - Code snippet showing key structure
3. **Key Decisions** — Bulleted list with explanations
   - Decision + Why + Trade-off
4. **Code Highlights** — 1–2 key code snippets with inline explanation
5. **Metrics** (if applicable) — e.g., "Covers 27 companies, processes 100+ jobs/day"
6. **Links** — GitHub, live demo, blog post (if exists)

**Example: Jobify**
```
┌──────────────────────────────────────┐
│ JOBIFY - Job Aggregation Platform    │
│ Status: Active (Pre-launch)          │
├──────────────────────────────────────┤
│ Tech: MERN, Puppeteer, Redis, Render │
│ Repo: github.com/...  Demo: [link]   │
└──────────────────────────────────────┘

$ Problem
> Scale job scraping across 27 companies
> Deploy scraper on free Render tier
> Keep index fresh with minimal resource

$ Architecture
[ASCII or SVG diagram showing:
  - Scraper configs (Git as IaC)
  - Worker pool executor
  - ScraperStatus + ScraperRun collections
  - Frontend Redux state + JWT auth
]

$ Key Decisions
• Config-driven scraper engine
  Why: Easier to add companies without code changes
  Trade: Need to maintain Puppeteer selectors

• Parallel worker pool for execution
  Why: Speed up scraping across all companies
  Trade: More complex error handling

• ScraperStatus + ScraperRun collection pattern
  Why: Track history + current state separately
  Trade: Denormalization but cleaner queries

$ Metrics
• 27 company integrations active
• 100+ jobs indexed daily
• Scraper runs on 2AM cron
• ~2-3 min execution with 27 parallel tasks
```

### 3. **About / Contact**
Style as:
- `cat about.txt` — Bio and background
- `cat contact.txt` — Email, GitHub, LinkedIn links
- Could have a simple contact form styled as a "message" command

### 4. **Global Design Rules**
- **Spacing**: Consistent padding in panels (use CSS variables for margins)
- **Links**: Always `#2DD4BF`, underlined or with an arrow `→`
- **Hover states**: Slight color shift or background highlight
- **Code blocks**: Dark background (`#1A1A1A`), syntax highlighting if possible
- **Images/Diagrams**: Bordered, monospace-friendly captions
- **Responsiveness**: Stack panels vertically on mobile, maintain monospace readability

---

## Technical Requirements

### Stack
- **Framework**: Astro (static generation, minimal JS)
- **Styling**: CSS variables + plain CSS (no Tailwind, for full control)
- **Components**: React (optional, only for interactive bits like project filters)
- **Fonts**: JetBrainsMono Nerd Font (primary), IBM Plex Mono or Courier Prime (body)

### File Structure
```
/src
  /pages
    index.astro (homepage)
    /projects
      [slug].astro (project detail template)
    /about.astro
    /contact.astro
  /components
    ProjectPanel.astro (reusable panel component)
    SystemInfo.astro (homepage system display)
  /styles
    global.css (colors, typography, theme variables)
    terminal.css (border styles, panel styling)
  /content
    projects/ (markdown files for each project)
      jobify.md
      redrob.md
      passwordpal.md
      medistock.md
      sensory-safari.md
```

### CSS Variables (Global Theme)
```css
:root {
  --bg: #161320;
  --bg-secondary: #1A1A1A;
  --text: #E8E8E8;
  --text-muted: #999999;
  --border: #404040;
  --accent: #2DD4BF;
  --red: #FF5555;
  --yellow: #FFFF55;
  --green: #55FF55;
  --font-mono: 'JetBrainsMono Nerd Font', monospace;
  --font-body: 'IBM Plex Mono', monospace;
}
```

---

## Interactive Elements (Low Priority, Can Be Added Later)
- **Project Filter**: `$ ls projects --filter [tech/year]` (fade in/out projects)
- **Command Prompt**: Type-ahead navigation (optional, could feel gimmicky)
- **Terminal Boot Animation**: Subtle typewriter effect on homepage load
- **Hover Tooltips**: Show tooltip on hover (e.g., tech stack breakdown)

---

## Deliverables
1. **Homepage** (`index.astro`)
   - System info display
   - Project listing
   - Navigation structure

2. **Project Template** (`[slug].astro`)
   - Panel styling
   - Content sections (Problem, Architecture, Decisions, Code, Links)
   - Responsive layout

3. **Global Styles** (`global.css` + `terminal.css`)
   - Color palette locked in
   - Typography defined
   - Panel/border styling

4. **Content** (`.md` files)
   - Each project filled out with:
     - Problem statement
     - Architecture overview
     - Key decisions
     - Code snippets (if applicable)
     - Links and metrics

5. **About/Contact Pages**
   - Simple, styled consistently

---

## Notes for Agent
- **Keep it minimal.** No unnecessary animations or effects. The aesthetic speaks for itself.
- **Monospace throughout.** This is the core visual constraint—maintain it everywhere.
- **Content is king.** The architecture explanations + project depth are what make this unique. Design should support, not overshadow.
- **No rounded corners.** All panels/boxes should have sharp corners (terminal-style).
- **Dark theme only.** No light mode toggle needed.
- **Fast load.** Astro static generation should result in a very fast site. Avoid heavy dependencies.
