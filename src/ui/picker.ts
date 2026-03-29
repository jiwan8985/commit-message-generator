import * as vscode from "vscode";
import type { CommitSuggestion } from "../providers/types";

const EDIT_LABEL = "$(edit)  Edit manually…";
const SEPARATOR_LABEL = "";

/**
 * Shows a Quick Pick with AI suggestions and returns the chosen commit message string.
 * Always shows the picker so the user can review before applying.
 */
export async function showSuggestionPicker(
  suggestions: CommitSuggestion[],
  providerLabel: string
): Promise<string | undefined> {
  type SuggItem = vscode.QuickPickItem & { suggestion?: CommitSuggestion };

  const items: SuggItem[] = suggestions.map((s, i) => ({
    label: `$(sparkle)  ${s.subject}`,
    description: s.body ? "with body" : undefined,
    detail: s.body
      ? s.body
          .split("\n")
          .slice(0, 3)
          .map((l) => `  ${l}`)
          .join("\n")
      : undefined,
    suggestion: s,
    // Unique alwaysShow to render all items even when filtering
    alwaysShow: true,
  }));

  if (suggestions.length > 0) {
    items.push(
      { label: SEPARATOR_LABEL, kind: vscode.QuickPickItemKind.Separator } as SuggItem,
    );
  }

  items.push({
    label: EDIT_LABEL,
    description: "write a custom message",
    alwaysShow: true,
  });

  const pick = await vscode.window.showQuickPick(items, {
    title: `Git Commit Wizard — ${providerLabel}`,
    placeHolder:
      suggestions.length > 0
        ? "Select a suggestion or edit manually"
        : "No suggestions generated — edit manually",
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!pick) return undefined;

  // "Edit manually" branch
  if (pick.label === EDIT_LABEL) {
    const prefill = suggestions[0]
      ? formatMessage(suggestions[0])
      : "";
    return vscode.window.showInputBox({
      title: "Commit Message",
      value: prefill,
      prompt: "Edit commit message (Conventional Commits format)",
      placeHolder: "feat(scope): describe your change",
      ignoreFocusOut: true,
    });
  }

  return pick.suggestion ? formatMessage(pick.suggestion) : undefined;
}

function formatMessage(s: CommitSuggestion): string {
  return s.body ? `${s.subject}\n\n${s.body}` : s.subject;
}
