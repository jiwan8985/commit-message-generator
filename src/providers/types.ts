export interface CommitSuggestion {
  subject: string;
  body?: string;
}

export interface GenerateOptions {
  count: number;
  language: string;
  useEmoji: boolean;
  maxSubjectLength: number;
  customPrompt?: string;
}

export interface AIProvider {
  generate(diff: string, options: GenerateOptions): Promise<CommitSuggestion[]>;
}

/**
 * Parses LLM response text into CommitSuggestion[].
 * Tries JSON first, falls back to regex extraction.
 */
export function parseSuggestions(text: string): CommitSuggestion[] {
  // 1. Try JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { suggestions?: unknown[] };
      const sug = parsed.suggestions;
      if (Array.isArray(sug) && sug.length > 0) {
        const results = sug
          .filter((s): s is { subject: string; body?: string } =>
            typeof (s as Record<string, unknown>)["subject"] === "string" &&
            Boolean(((s as Record<string, unknown>)["subject"] as string).trim())
          )
          .map((s) => ({
            subject: s.subject.trim(),
            body: typeof s.body === "string" && s.body.trim() ? s.body.trim() : undefined,
          }));
        if (results.length > 0) return results;
      }
    } catch {
      // fall through to regex
    }
  }

  // 2. Regex fallback — extract conventional commit lines
  const commitPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([^)]*\))?!?: .+/;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => commitPattern.test(l));

  if (lines.length > 0) {
    return lines.slice(0, 5).map((subject) => ({ subject }));
  }

  return [];
}
