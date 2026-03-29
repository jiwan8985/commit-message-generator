import * as vscode from "vscode";
import type { Config } from "../config";

const PROVIDER_ICON: Record<string, string> = {
  anthropic: "$(hubot)",
  openai: "$(hubot)",
  groq: "$(zap)",
  ollama: "$(server-process)",
  "rule-based": "$(symbol-ruler)",
};

const PROVIDER_LABEL: Record<string, string> = {
  anthropic: "Claude",
  openai: "GPT",
  groq: "Groq",
  ollama: "Ollama",
  "rule-based": "Rule-based",
};

export function createStatusBarItem(context: vscode.ExtensionContext): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
  item.command = "commitWizard.configure";
  context.subscriptions.push(item);
  return item;
}

export function updateStatusBar(item: vscode.StatusBarItem, config: Config): void {
  const icon = PROVIDER_ICON[config.aiProvider] ?? "$(sparkle)";
  const label = PROVIDER_LABEL[config.aiProvider] ?? config.aiProvider;
  item.text = `${icon} Commit`;
  item.tooltip = new vscode.MarkdownString(
    `**Git Commit Wizard**\n\nProvider: \`${label}\`\n\nClick to switch provider`
  );
  item.show();
}
