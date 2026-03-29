import type { Config } from "../config";
import type { AIProvider } from "./types";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { GroqProvider } from "./groq";
import { OllamaProvider } from "./ollama";

export interface ProviderResult {
  provider: AIProvider | null;
  /** True if provider was requested but API key is missing. */
  missingKey: boolean;
  /** Setting key for the missing API key, e.g. "anthropicApiKey". */
  keySettingName?: string;
  /** Human-readable provider label. */
  label: string;
}

export function createProvider(config: Config): ProviderResult {
  switch (config.aiProvider) {
    case "anthropic":
      if (!config.anthropicApiKey) {
        return { provider: null, missingKey: true, keySettingName: "anthropicApiKey", label: "Anthropic" };
      }
      return {
        provider: new AnthropicProvider(config.anthropicApiKey, config.anthropicModel),
        missingKey: false,
        label: `Anthropic (${config.anthropicModel})`,
      };

    case "openai":
      if (!config.openaiApiKey) {
        return { provider: null, missingKey: true, keySettingName: "openaiApiKey", label: "OpenAI" };
      }
      return {
        provider: new OpenAIProvider(config.openaiApiKey, config.openaiModel, config.openaiBaseUrl),
        missingKey: false,
        label: `OpenAI (${config.openaiModel})`,
      };

    case "groq":
      if (!config.groqApiKey) {
        return { provider: null, missingKey: true, keySettingName: "groqApiKey", label: "Groq" };
      }
      return {
        provider: new GroqProvider(config.groqApiKey, config.groqModel),
        missingKey: false,
        label: `Groq (${config.groqModel})`,
      };

    case "ollama":
      return {
        provider: new OllamaProvider(config.ollamaUrl, config.ollamaModel),
        missingKey: false,
        label: `Ollama (${config.ollamaModel})`,
      };

    default:
      return { provider: null, missingKey: false, label: "Rule-based" };
  }
}
