# Changelog

All notable changes to **Commit Message Generator** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Groq AI backend for `analyzer.ts` (opt-in via `commitMessageGenerator.useAI`)
- Multi-repository workspace support
- User-defined type override via quick-pick menu
- Keybinding support (`Ctrl+Alt+M`)

---

## [0.1.0] — 2026-03-28

### Added
- `Generate Commit Message` command registered in the Command Palette (`Ctrl+Shift+P`)
- ✨ Sparkle button in the Source Control panel title bar (visible only when a Git repo is open)
- Rule-based diff analyzer (`analyzer.ts`)
  - Detects commit type: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `test`
  - Extracts scope from file path hierarchy (longest common directory prefix)
  - Parses function/class/arrow-function names from added diff lines for description
  - Supports TypeScript, JavaScript, and Python symbol detection
- Conventional Commits formatter (`formatter.ts`)
  - Subject line capped at 72 characters with automatic truncation
  - Optional multi-file body listing
- Configuration entries reserved for future AI integration
  - `commitMessageGenerator.useAI` (boolean)
  - `commitMessageGenerator.groqApiKey` (string)
- Progress notification while generating the message
- Warning when no staged changes are found

[Unreleased]: https://github.com/your-username/commit-message-generator/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-username/commit-message-generator/releases/tag/v0.1.0
