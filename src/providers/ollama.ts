import { buildSystemPrompt, buildUserMessage } from "../prompts";
import type { AIProvider, CommitSuggestion, GenerateOptions } from "./types";
import { parseSuggestions } from "./types";

export class OllamaProvider implements AIProvider {
  constructor(private baseUrl: string, private model: string) {}

  async generate(diff: string, opts: GenerateOptions): Promise<CommitSuggestion[]> {
    const url = `${this.baseUrl.replace(/\/$/, "")}/api/chat`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: "system", content: buildSystemPrompt(opts) },
          { role: "user", content: buildUserMessage(diff, opts.count) },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Ollama error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as {
      message?: { content?: string };
    };
    const text = data.message?.content ?? "";
    return parseSuggestions(text);
  }
}
