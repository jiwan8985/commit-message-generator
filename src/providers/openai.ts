import { buildSystemPrompt, buildUserMessage } from "../prompts";
import type { AIProvider, CommitSuggestion, GenerateOptions } from "./types";
import { parseSuggestions } from "./types";

export class OpenAIProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private model: string,
    private baseUrl: string = "https://api.openai.com/v1"
  ) {}

  async generate(diff: string, opts: GenerateOptions): Promise<CommitSuggestion[]> {
    const url = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        messages: [
          { role: "system", content: buildSystemPrompt(opts) },
          { role: "user", content: buildUserMessage(diff, opts.count) },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`OpenAI API error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    return parseSuggestions(text);
  }
}
