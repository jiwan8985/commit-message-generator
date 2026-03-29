import { buildSystemPrompt, buildUserMessage } from "../prompts";
import type { AIProvider, CommitSuggestion, GenerateOptions } from "./types";
import { parseSuggestions } from "./types";

export class AnthropicProvider implements AIProvider {
  constructor(private apiKey: string, private model: string) {}

  async generate(diff: string, opts: GenerateOptions): Promise<CommitSuggestion[]> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: buildSystemPrompt(opts),
        messages: [{ role: "user", content: buildUserMessage(diff, opts.count) }],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Anthropic API error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    return parseSuggestions(text);
  }
}
