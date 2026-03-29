import * as vscode from "vscode";

export type ProviderName = "anthropic" | "openai" | "groq" | "ollama" | "rule-based";

export interface Config {
  aiProvider: ProviderName;
  anthropicApiKey: string;
  anthropicModel: string;
  openaiApiKey: string;
  openaiModel: string;
  openaiBaseUrl: string;
  groqApiKey: string;
  groqModel: string;
  ollamaUrl: string;
  ollamaModel: string;
  suggestionCount: number;
  language: string;
  useEmoji: boolean;
  maxSubjectLength: number;
  customPrompt: string;
}

export function getConfig(): Config {
  const c = vscode.workspace.getConfiguration("commitWizard");
  return {
    aiProvider: c.get<ProviderName>("aiProvider", "rule-based"),
    anthropicApiKey: c.get<string>("anthropicApiKey", ""),
    anthropicModel: c.get<string>("anthropicModel", "claude-3-5-haiku-20241022"),
    openaiApiKey: c.get<string>("openaiApiKey", ""),
    openaiModel: c.get<string>("openaiModel", "gpt-4o-mini"),
    openaiBaseUrl: c.get<string>("openaiBaseUrl", "https://api.openai.com/v1"),
    groqApiKey: c.get<string>("groqApiKey", ""),
    groqModel: c.get<string>("groqModel", "llama-3.1-8b-instant"),
    ollamaUrl: c.get<string>("ollamaUrl", "http://localhost:11434"),
    ollamaModel: c.get<string>("ollamaModel", "llama3.2"),
    suggestionCount: c.get<number>("suggestionCount", 3),
    language: c.get<string>("language", "English"),
    useEmoji: c.get<boolean>("useEmoji", false),
    maxSubjectLength: c.get<number>("maxSubjectLength", 72),
    customPrompt: c.get<string>("customPrompt", ""),
  };
}

export async function promptAndSaveApiKey(provider: string, settingKey: string): Promise<string | undefined> {
  const key = await vscode.window.showInputBox({
    title: `${provider} API Key`,
    prompt: `Enter your ${provider} API key to enable AI-powered commit messages`,
    password: true,
    placeHolder: "sk-...",
    ignoreFocusOut: true,
  });

  if (key?.trim()) {
    await vscode.workspace
      .getConfiguration("commitWizard")
      .update(settingKey, key.trim(), vscode.ConfigurationTarget.Global);
    return key.trim();
  }
  return undefined;
}
