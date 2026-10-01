/**
 * @file Personal details shown by several commands (aboutme, cat, neofetch…).
 * @module lib/terminal/commands/profile
 */

export const EMAIL = 'prjnkrthk@gmail.com';

export const BIO_LINES = [
  'Final-year CS undergrad at Amrita Vishwa Vidyapeetham, Coimbatore.',
  'I like building things end to end: a zero-knowledge password manager',
  'in Rust and Tauri, distributed systems in Go, and AI pipelines that',
  'rank 100K candidates on a CPU in under 5 minutes. I care about',
  'software that works exactly as intended for the person using it.',
];

export const NOW_LINES = [
  "As web lead at Intel IoT Club, I'm building Jobify, a job aggregation",
  'platform that pulls openings straight from company career pages.',
  'I think in systems: how data flows, where latency hides, what breaks first.',
];

export const STACK = [
  ['Web     ', 'React, Node.js, Express, PostgreSQL, MongoDB'],
  ['Systems ', 'Rust (Tauri), Go, C++'],
  ['AI/ML   ', 'Python, PyTorch, LangChain, FAISS, LLM APIs'],
];

export const SOCIAL = [
  ['GitHub   ', 'https://github.com/USER1043', 'github.com/USER1043'],
  ['LinkedIn ', 'https://linkedin.com/in/prajan-karthik', 'linkedin.com/in/prajan-karthik'],
  ['Email    ', `mailto:${EMAIL}`, EMAIL],
];

// System info for neofetch (from docs/portfolio_redesign_brief.md).
export const SYSTEM = {
  user: 'prajan',
  host: 'portfolio',
  os: 'Arch Linux x86_64',
  kernel: '7.0.14-arch1-1',
  wm: 'Hyprland',
  shell: 'bash (well, this one)',
  role: 'Final-year CS @ Amrita · Intel IoT Club web lead',
  stack: 'React, Node.js, Rust, Go, Python',
};
