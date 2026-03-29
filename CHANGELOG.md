# Changelog

All notable changes to **Git Commit Wizard** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] — 2026-03-29

### Added

- **AI provider support** — generate commit messages with real AI:
  - Anthropic Claude (`claude-3-5-haiku`, `claude-3-5-sonnet`, `claude-3-opus`)
  - OpenAI GPT (`gpt-4o-mini` and any OpenAI-compatible API)
  - Groq — fast inference, free tier available
  - Ollama — local AI, fully private, no API key needed
- **Multiple suggestions** — AI generates up to 5 suggestions; pick the best one via Quick Pick
- **Edit before applying** — "Edit manually" option always available in the picker
- **Gitmoji support** — optional emoji prefix per commit type (`✨ feat`, `🐛 fix`, …)
- **Multi-language output** — generate commit messages in any language (Korean, Japanese, English, …)
- **Custom prompt** — inject your own instructions into the AI system prompt
- **Status bar item** — shows the active provider at a glance; click to switch
- **Keyboard shortcut** — `Cmd+Alt+Enter` (Mac) / `Ctrl+Alt+Enter` (Windows/Linux) triggers generation from the SCM panel
- **Configure command** — `Git Commit Wizard: Configure AI Provider` with inline API key entry
- **Configurable subject length** — `commitWizard.maxSubjectLength` (default 72)
- **esbuild bundling** — faster extension load, no runtime npm dependencies

### Changed

- **Rule-based mode is still the default** — works offline with zero configuration
- Rule-based result is now applied immediately (no picker) with **"편집 / Edit"** and **"재생성 / Regenerate"** action buttons
- Configuration namespace changed from `commitMessageGenerator.*` to `commitWizard.*`
- Extension renamed from "Commit Message Generator" → **"Git Commit Wizard"**
- `commitMessageGenerator.generate` command still works as a backward-compatible alias

### Removed

- `commitMessageGenerator.useAI` and `commitMessageGenerator.groqApiKey` settings (replaced by `commitWizard.*`)

---

## [0.1.0] — 2026-03-28

### Added

- `Generate Commit Message` command in the Command Palette
- ✨ Sparkle button in the Source Control panel title bar
- Rule-based diff analyzer
  - Commit type detection: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `test`
  - Scope detection from file path hierarchy
  - Symbol extraction (function / class / arrow-function) for description
  - TypeScript, JavaScript, and Python support
- Conventional Commits formatter with 72-character subject truncation
- Progress notification during generation
- Warning when no staged files are found

---

[0.2.0]: https://github.com/jiwan8985/commit-message-generator/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jiwan8985/commit-message-generator/releases/tag/v0.1.0
