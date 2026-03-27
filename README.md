# Commit Message Generator

> Instantly generate [Conventional Commits](https://www.conventionalcommits.org/) messages from your staged Git diff — no AI key required.

---

## Features

- **One-click generation** — click the ✨ button in the Source Control panel or run the command from the palette
- **Conventional Commits format** — automatically picks the right type: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `test`
- **Smart scope & description** — parses changed file paths and function/class names to fill in scope and description
- **Zero configuration** — works out of the box with the built-in VS Code Git extension
- **AI-ready architecture** — the analyzer module is designed to be swapped with a Groq (or any LLM) backend when you're ready

---

## Usage

### Source Control panel button

Stage your files, then click the **✨ sparkle icon** in the top-right of the Source Control panel.

### Command Palette

1. `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type **Generate Commit Message**
3. Press `Enter`

The commit message input box is filled in automatically.

---

## Generated message examples

| Staged change | Generated message |
|---|---|
| New `src/auth/login.ts` with `function loginUser` | `feat(auth): add loginUser` |
| Edit `src/api/users.ts` with "fix null error" in diff | `fix(api): fix issues in users` |
| Edit `README.md` | `docs: update README` |
| Edit `package.json` | `chore: update package.json` |
| Edit `src/components/Button.scss` | `style(components): update styles in Button` |
| Edit `src/__tests__/auth.test.ts` | `test: add tests for auth` |

---

## Type detection rules

| Priority | Condition | Type |
|---|---|---|
| 1 | Path contains `test`, `spec`, or `__tests__` | `test` |
| 2 | All files are `.md / .rst / .txt` or under `docs/` | `docs` |
| 3 | All files are `package.json`, `*.yaml`, config files | `chore` |
| 4 | All files are `.css / .scss / .sass / .less` | `style` |
| 5 | Diff contains `fix`, `bug`, `error`, `crash` … | `fix` |
| 6 | Any file is newly created | `feat` |
| 7 | Diff contains `refactor`, `rename`, `extract` … | `refactor` |
| 8 | (default) | `feat` |

---

## Configuration

| Setting | Type | Default | Description |
|---|---|---|---|
| `commitMessageGenerator.useAI` | `boolean` | `false` | Use Groq AI instead of rule-based analysis |
| `commitMessageGenerator.groqApiKey` | `string` | `""` | Your Groq API key (required when `useAI` is `true`) |

> **Note:** AI integration is not yet active in v0.1. The settings are reserved for the upcoming v0.2 release.

Open **Settings** (`Ctrl+,`) and search for `Commit Message Generator` to configure.

---

## Extension development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode
npm run watch

# Press F5 in VS Code to launch the Extension Development Host
```

### Module structure

```
src/
├── extension.ts   # Command registration, Git API wiring
├── analyzer.ts    # Diff parsing & rule-based type/scope/description detection
└── formatter.ts   # Conventional Commits string formatter
```

`analyzer.ts` is the only file you need to replace to add AI support. Its public interface:

```typescript
export function analyze(diff: string): AnalyzerResult
```

---

## Requirements

- VS Code **1.85.0** or later
- A workspace with at least one Git repository

---

## Release notes

See [CHANGELOG.md](CHANGELOG.md).

---

## License

[MIT](LICENSE)
