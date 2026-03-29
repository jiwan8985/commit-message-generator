/**
 * extension.ts — Git Commit Wizard
 *
 * UX 원칙:
 *  - Rule-based: 설정 없이 바로 동작, 즉시 적용 (클릭 최소화)
 *  - AI 프로바이더: 선택 옵션, 복수 제안 피커 제공
 */

import * as vscode from "vscode";
import { getConfig, promptAndSaveApiKey } from "./config";
import { getGitRepo } from "./git";
import { createProvider } from "./providers/factory";
import { analyze } from "./analyzer.js";
import { format } from "./formatter.js";
import { showSuggestionPicker } from "./ui/picker";
import { createStatusBarItem, updateStatusBar } from "./ui/statusBar";
import type { CommitSuggestion } from "./providers/types";

// ─── Activation ───────────────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext): void {
  // 상태바
  const statusBar = createStatusBarItem(context);
  updateStatusBar(statusBar, getConfig());

  context.subscriptions.push(
    // 설정 변경 시 상태바 갱신
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("commitWizard")) {
        updateStatusBar(statusBar, getConfig());
      }
    }),
    vscode.commands.registerCommand("commitWizard.generate", runGenerate),
    vscode.commands.registerCommand("commitWizard.configure", runConfigure),
    // v0.1 단축키 호환
    vscode.commands.registerCommand("commitMessageGenerator.generate", runGenerate)
  );
}

export function deactivate(): void {}

// ─── Generate ─────────────────────────────────────────────────────────────────

async function runGenerate(): Promise<void> {
  const repo = await getGitRepo();
  if (!repo) return;

  let diff: string;
  try {
    diff = await repo.diff(true);
  } catch {
    vscode.window.showErrorMessage("Git Commit Wizard: staged diff를 읽는 데 실패했습니다.");
    return;
  }

  if (!diff.trim()) {
    vscode.window.showWarningMessage(
      "Git Commit Wizard: staged 파일이 없습니다. 먼저 파일을 stage 해주세요."
    );
    return;
  }

  const config = getConfig();
  const { provider, missingKey, keySettingName, label } = createProvider(config);

  // API 키 없음 → 인라인 안내
  if (missingKey && keySettingName) {
    const action = await vscode.window.showWarningMessage(
      `Git Commit Wizard: ${label} API 키가 설정되지 않았습니다.`,
      "API 키 입력",
      "설정 열기",
      "Rule-based로 계속"
    );

    if (action === "API 키 입력") {
      const key = await promptAndSaveApiKey(label, keySettingName);
      if (!key) return;
      return runGenerate(); // 재시도
    } else if (action === "설정 열기") {
      vscode.commands.executeCommand("workbench.action.openSettings", "commitWizard");
      return;
    } else if (action !== "Rule-based로 계속") {
      return;
    }
    // "Rule-based로 계속" → provider = null 상태로 진행
  }

  let suggestions: CommitSuggestion[] = [];
  let usedProvider = provider ? label : "Rule-based";
  let aiSuccess = false;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Git Commit Wizard: ${usedProvider} 분석 중…`,
      cancellable: false,
    },
    async () => {
      if (provider) {
        try {
          suggestions = await provider.generate(diff, {
            count: config.suggestionCount,
            language: config.language,
            useEmoji: config.useEmoji,
            maxSubjectLength: config.maxSubjectLength,
            customPrompt: config.customPrompt,
          });
          aiSuccess = suggestions.length > 0;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (/401|403|auth|unauthorized|forbidden/i.test(msg)) {
            const action = await vscode.window.showErrorMessage(
              `Git Commit Wizard: ${label} 인증 실패. API 키를 확인해주세요.`,
              "설정 열기"
            );
            if (action === "설정 열기") {
              vscode.commands.executeCommand("workbench.action.openSettings", "commitWizard");
            }
            return;
          }
          vscode.window.showWarningMessage(
            `Git Commit Wizard: AI 생성 실패 (${msg}). Rule-based로 대체합니다.`
          );
        }
      }

      // Rule-based 폴백 (또는 기본 모드)
      if (suggestions.length === 0) {
        usedProvider = "Rule-based";
        const result = analyze(diff);
        const full = format(result);
        const [subject, ...rest] = full.split("\n\n");
        suggestions = [{ subject, body: rest.join("\n\n") || undefined }];
      }
    }
  );

  if (suggestions.length === 0) return;

  // ── UX 분기 ──────────────────────────────────────────────────────────────
  // Rule-based: 즉시 적용 (마찰 최소화) + "편집" 버튼
  // AI:         피커에서 여러 제안 선택
  if (!aiSuccess) {
    const message = formatMessage(suggestions[0]);
    repo.inputBox.value = message;

    const firstLine = message.split("\n")[0];
    const action = await vscode.window.showInformationMessage(
      `✓ "${firstLine}"`,
      "편집",
      "재생성"
    );
    if (action === "편집") {
      vscode.commands.executeCommand("workbench.view.scm");
    } else if (action === "재생성") {
      repo.inputBox.value = "";
      return runGenerate();
    }
    return;
  }

  // AI 제안 피커
  const message = await showSuggestionPicker(suggestions, usedProvider);
  if (!message) return;

  repo.inputBox.value = message;
  const firstLine = message.split("\n")[0];
  vscode.window.showInformationMessage(`✓ "${firstLine}"`);
}

// ─── Configure ────────────────────────────────────────────────────────────────

async function runConfigure(): Promise<void> {
  const config = getConfig();

  type Item = vscode.QuickPickItem & { value: string };

  const providerItems: Item[] = [
    {
      label: "$(symbol-ruler)  Rule-based  — 설정 불필요, 오프라인 동작",
      description: config.aiProvider === "rule-based" ? "● 현재 사용 중" : "",
      value: "rule-based",
    },
    {
      label: "",
      kind: vscode.QuickPickItemKind.Separator,
      value: "",
    },
    {
      label: "$(hubot)  Anthropic Claude",
      description: config.aiProvider === "anthropic" ? "● 현재 사용 중" : "API 키 필요",
      detail: config.anthropicApiKey ? `모델: ${config.anthropicModel}` : "설정 후 사용 가능",
      value: "anthropic",
    },
    {
      label: "$(hubot)  OpenAI GPT",
      description: config.aiProvider === "openai" ? "● 현재 사용 중" : "API 키 필요",
      detail: config.openaiApiKey ? `모델: ${config.openaiModel}` : "설정 후 사용 가능",
      value: "openai",
    },
    {
      label: "$(zap)  Groq  — 빠른 무료 티어",
      description: config.aiProvider === "groq" ? "● 현재 사용 중" : "API 키 필요 (무료)",
      detail: config.groqApiKey ? `모델: ${config.groqModel}` : "console.groq.com 에서 무료 발급",
      value: "groq",
    },
    {
      label: "$(server-process)  Ollama  — 로컬 AI, 완전 무료·비공개",
      description: config.aiProvider === "ollama" ? "● 현재 사용 중" : "로컬 서버 필요",
      detail: `서버: ${config.ollamaUrl}  모델: ${config.ollamaModel}`,
      value: "ollama",
    },
  ];

  const picked = await vscode.window.showQuickPick(providerItems, {
    title: "Git Commit Wizard — AI 프로바이더 선택",
    placeHolder: "엔터로 선택, ESC로 취소",
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!picked || !picked.value) return;

  await vscode.workspace
    .getConfiguration("commitWizard")
    .update("aiProvider", picked.value, vscode.ConfigurationTarget.Global);

  // 선택한 프로바이더에 API 키가 필요하고 없는 경우 → 즉시 입력 유도
  const needsKey: Record<string, { key: keyof typeof config; settingName: string }> = {
    anthropic: { key: "anthropicApiKey", settingName: "anthropicApiKey" },
    openai: { key: "openaiApiKey", settingName: "openaiApiKey" },
    groq: { key: "groqApiKey", settingName: "groqApiKey" },
  };

  const keyInfo = needsKey[picked.value];
  if (keyInfo && !config[keyInfo.key]) {
    const enter = await vscode.window.showInformationMessage(
      `"${picked.value}" 프로바이더를 사용하려면 API 키가 필요합니다.`,
      "지금 입력",
      "나중에"
    );
    if (enter === "지금 입력") {
      const labels: Record<string, string> = {
        anthropic: "Anthropic",
        openai: "OpenAI",
        groq: "Groq",
      };
      await promptAndSaveApiKey(labels[picked.value] ?? picked.value, keyInfo.settingName);
    }
    return;
  }

  vscode.window.showInformationMessage(
    `Git Commit Wizard: "${picked.value}" 프로바이더로 전환했습니다.`
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMessage(s: CommitSuggestion): string {
  return s.body ? `${s.subject}\n\n${s.body}` : s.subject;
}
