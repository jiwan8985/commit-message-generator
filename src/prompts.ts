export interface PromptOptions {
  count: number;
  language: string;
  useEmoji: boolean;
  maxSubjectLength: number;
  customPrompt?: string;
}

// Gitmoji map for common commit types
const GITMOJI: Record<string, string> = {
  feat: "✨",
  fix: "🐛",
  docs: "📝",
  style: "💄",
  refactor: "♻️",
  perf: "⚡️",
  test: "✅",
  chore: "🔧",
  ci: "👷",
  build: "📦",
  revert: "⏪️",
};

export function buildSystemPrompt(opts: PromptOptions): string {
  const emojiSection = opts.useEmoji
    ? `- Prefix the description with a gitmoji based on the type:\n  ${Object.entries(GITMOJI).map(([t, e]) => `${e} ${t}`).join(", ")}\n`
    : "";

  const customSection = opts.customPrompt?.trim()
    ? `\nAdditional instructions:\n${opts.customPrompt.trim()}\n`
    : "";

  return `You are an expert git commit message generator following the Conventional Commits specification.

Generate ${opts.count} distinct commit message suggestion(s) from the staged diff.

## Rules
- Subject format: <type>[optional scope]: <description>
- Valid types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
- Scope: affected module or component in lowercase, no spaces (optional)
- Description: imperative mood ("add" not "added"), lowercase, no trailing period
- Subject line MUST NOT exceed ${opts.maxSubjectLength} characters total
- Body: add concise bullet points if the change is complex or touches multiple files (optional)
- Add "BREAKING CHANGE: <description>" footer if the change breaks backward compatibility
${emojiSection}- Write in ${opts.language}
${customSection}
## Response format
Respond ONLY with valid JSON — no markdown, no explanation:
{"suggestions":[{"subject":"<subject line>","body":"<optional multiline body>"}]}

For ${opts.count} suggestion(s), make each one a slightly different perspective or emphasis.`;
}

export function buildUserMessage(diff: string, count: number): string {
  const truncated = diff.length > 14000 ? diff.slice(0, 14000) + "\n\n…(diff truncated)" : diff;
  return `Generate ${count} commit message suggestion(s) for this staged diff:\n\`\`\`diff\n${truncated}\n\`\`\``;
}
