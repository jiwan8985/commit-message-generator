# Git Commit Wizard

> AI-powered [Conventional Commits](https://www.conventionalcommits.org/) generator for VS Code.
> Works **out of the box with no setup** — AI providers are optional.

---

## Quick Start

1. Stage your files
2. Click the **✨ button** in the Source Control panel — or press `Cmd+Alt+Enter`
3. Done ✓

No API key needed. The extension works offline with rule-based analysis by default.

---

## Features

| | Feature | Default |
|---|---|---|
| ✅ | One-click commit message generation | |
| ✅ | [Conventional Commits](https://www.conventionalcommits.org/) format | |
| ✅ | Works offline, zero config | ● |
| ✅ | AI providers: Anthropic, OpenAI, Groq, Ollama | optional |
| ✅ | Multiple AI suggestions — pick the best one | |
| ✅ | Edit before applying | |
| ✅ | [Gitmoji](https://gitmoji.dev/) support | optional |
| ✅ | Generate in any language | optional |
| ✅ | Custom AI prompt | optional |
| ✅ | Status bar — shows active provider | |
| ✅ | Keyboard shortcut `Cmd+Alt+Enter` | |

---

## AI Providers (Optional)

The extension defaults to **rule-based** mode — no API key, no internet, works instantly.

When you want smarter results, switch to an AI provider:

| Provider | Cost | Privacy | How to get a key |
|----------|------|---------|-----------------|
| **Groq** | Free tier | Cloud | [console.groq.com](https://console.groq.com/) |
| **Anthropic Claude** | Paid | Cloud | [console.anthropic.com](https://console.anthropic.com/) |
| **OpenAI GPT** | Paid | Cloud | [platform.openai.com](https://platform.openai.com/) |
| **Ollama** | Free | **Local** | [ollama.com](https://ollama.com/) |

### Switch provider

Click the status bar item at the bottom of VS Code, or run:

```
Git Commit Wizard: Configure AI Provider
```

The extension will prompt you to enter your API key if needed.

---

## Configuration

Open Settings (`Cmd+,`) and search for **`commitWizard`**.

| Setting | Default | Description |
|---------|---------|-------------|
| `commitWizard.aiProvider` | `rule-based` | Active provider |
| `commitWizard.anthropicApiKey` | `""` | Anthropic API key |
| `commitWizard.anthropicModel` | `claude-3-5-haiku-20241022` | Anthropic model |
| `commitWizard.openaiApiKey` | `""` | OpenAI API key |
| `commitWizard.openaiModel` | `gpt-4o-mini` | OpenAI model |
| `commitWizard.openaiBaseUrl` | `https://api.openai.com/v1` | Base URL (Azure, Together AI, …) |
| `commitWizard.groqApiKey` | `""` | Groq API key |
| `commitWizard.groqModel` | `llama-3.1-8b-instant` | Groq model |
| `commitWizard.ollamaUrl` | `http://localhost:11434` | Ollama server URL |
| `commitWizard.ollamaModel` | `llama3.2` | Ollama model |
| `commitWizard.suggestionCount` | `3` | Number of AI suggestions (1–5) |
| `commitWizard.language` | `English` | Language for commit messages |
| `commitWizard.useEmoji` | `false` | Add gitmoji prefix |
| `commitWizard.maxSubjectLength` | `72` | Subject line max length |
| `commitWizard.customPrompt` | `""` | Extra instructions for AI |

---

## How It Works

### Rule-based (default)

| Priority | Condition | Type |
|----------|-----------|------|
| 1 | Path contains `test`, `spec`, `__tests__` | `test` |
| 2 | All files are `.md / .rst / .txt` or under `docs/` | `docs` |
| 3 | All files are config files (`*.json`, `*.yaml`, …) | `chore` |
| 4 | All files are `.css / .scss / .sass / .less` | `style` |
| 5 | Diff contains `fix`, `bug`, `error`, `crash`… | `fix` |
| 6 | Any file is newly created | `feat` |
| 7 | Diff contains `refactor`, `rename`, `extract`… | `refactor` |
| 8 | (default) | `feat` |

### AI mode

The staged diff is sent to the selected AI provider with a structured Conventional Commits prompt. The AI returns up to 5 suggestions; you pick the one you like (or edit it before applying).

---

## Requirements

- VS Code **1.85.0** or later
- A workspace with at least one Git repository

---

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

---

## License

[MIT](LICENSE)
