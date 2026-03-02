---
trigger: always_on
---

"Always execute shell commands using zsh -c '<command>' to ensure the correct environment and PATH from ~/.zshrc are loaded."
"If npx or npm are not found, search for them in /usr/local/bin or the path specified in my .zshrc." 