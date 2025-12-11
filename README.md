# 👨‍💻 Prajan Karthik - Personal Portfolio

![Project Status](https://img.shields.io/badge/status-active-success)
![Design System](https://img.shields.io/badge/design-glassmorphism-blueviolet)
![Tech](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-orange)

A responsive, highly interactive personal portfolio website designed to showcase my full-stack engineering projects, skills, and experience. Built with semantic HTML, modern CSS (Variables + Grid), and Vanilla JavaScript.

## ✨ Key Features

* **🎨 Glassmorphism Design System:** Custom CSS implementation using `backdrop-filter`, translucent backgrounds, and a muted green color palette (`--accent: #0faf64`).
* **⚡ Component-Based Architecture:** The Navigation bar is modularized (`nav.html`) and dynamically loaded into every page using the JavaScript `fetch` API to ensure consistency.
* **📱 Fully Responsive:** Adaptive layouts using CSS Grid and Flexbox that scale from desktop down to mobile devices.
* **🔍 Interactive Elements:**
    * Custom modal popups for detailed project descriptions.
    * Loading spinners and fade-in page transitions.
    * Active state tracking for navigation links.
* **📬 Contact Integration:** Functional `mailto` forms for direct email communication.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3
* **Scripting:** Vanilla JavaScript (ES6+)
* **Styling:** Custom CSS Variables (`:root`), Flexbox, CSS Grid, Animations.
* **Assets:** FontAwesome (implied icons), Google Fonts (System UI fallback).

## 📂 Project Structure

```text
/
├── index.html          # Landing page (Hero section + Quick snapshot)
├── work.html           # Project showcase with Modal details
├── skills.html         # Skills breakdown (Fullstack, Mobile, Security)
├── contact.html        # Contact form and social links
├── component/
│   └── nav.html        # Reusable navigation component
├── css/
│   ├── global.css      # Variables, Reset, Typography, Animations
│   ├── style.css       # Home page specific styles
│   ├── work.css        # Projects grid and Modal styles
│   ├── skills.css      # Skills cards styles
│   ├── contact.css     # Form and Social grid styles
│   └── nav.css         # Navigation styling
└── images/             # (Create this folder for your avatar/assets)
```

## 👤 Author

Prajan Karthik

  - Role: Full-stack Developer & CS Undergrad
  - Focus: MERN Stack, Mobile Dev, Security, DevOps
