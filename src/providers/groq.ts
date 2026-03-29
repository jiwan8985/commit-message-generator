import { OpenAIProvider } from "./openai";
import type { AIProvider } from "./types";

/** Groq uses the OpenAI-compatible API at a different base URL. */
export class GroqProvider extends OpenAIProvider implements AIProvider {
  constructor(apiKey: string, model: string) {
    super(apiKey, model, "https://api.groq.com/openai/v1");
  }
}
