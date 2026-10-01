/**
 * @file Personal details shown by several commands (aboutme, cat, neofetch…).
 * @module lib/terminal/commands/profile
 */

export const EMAIL = 'prjnkrthk@gmail.com';

export const BIO_LINES = [
  "A CS undergrad obsessed with depth. I don't ship features until they",
  'work exactly as intended for the person using them. I\'ve built',
  'production systems that handle real users — job aggregation platforms',
  'with 700+ postings, password managers with military-grade crypto,',
  'and education platforms for kids with autism.',
];

export const NOW_LINES = [
  'Currently leading web architecture at Intel IoT Club while building',
  'Jobify into a full-scale product. I think in systems: how data flows,',
  'where latency hides, what breaks first.',
];

export const STACK = [
  ['Deep  ', 'React, Node.js, MongoDB, Express, Redux'],
  ['Solid ', 'Rust, TypeScript, Python, C++, PostgreSQL'],
  ['DSA   ', 'C++, algorithmic thinking, optimization'],
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
  role: 'CS undergrad · Intel IoT Club web lead',
};
