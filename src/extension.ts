/**
 * extension.ts
 *
 * VSCode extension entry point.
 * Registers the "Generate Commit Message" command and wires up the Git API.
 */

import * as vscode from "vscode";
import { analyze } from "./analyzer.js";
import { format } from "./formatter.js";

// ─── Git API types (from vscode.git built-in extension) ───────────────────────

interface GitExtension {
  getAPI(version: 1): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
}

interface Repository {
  inputBox: { value: string };
  diff(staged: boolean): Promise<string>;
}

// ─── Activation ───────────────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "commitMessageGenerator.generate",
    generateCommitMessage
  );
  context.subscriptions.push(disposable);
}

export function deactivate(): void {}

// ─── Command handler ─────────────────────────────────────────────────────────

async function generateCommitMessage(): Promise<void> {
  // 1. Acquire the built-in Git extension
  const gitExtension =
    vscode.extensions.getExtension<GitExtension>("vscode.git");

  if (!gitExtension) {
    vscode.window.showErrorMessage(
      "Commit Message Generator: Git extension not found."
    );
    return;
  }

  const git = gitExtension.isActive
    ? gitExtension.exports.getAPI(1)
    : (await gitExtension.activate()).getAPI(1);

  if (!git.repositories.length) {
    vscode.window.showWarningMessage(
      "Commit Message Generator: No Git repository found in the workspace."
    );
    return;
  }

  const repo = git.repositories[0];

  // 2. Get staged diff
  let diff: string;
  try {
    diff = await repo.diff(true); // true = staged
  } catch {
    vscode.window.showErrorMessage(
      "Commit Message Generator: Failed to read staged diff."
    );
    return;
  }

  if (!diff.trim()) {
    vscode.window.showWarningMessage(
      "Commit Message Generator: No staged changes found. Please stage files first."
    );
    return;
  }

  // 3. Analyze diff and format message
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Generating commit message…",
      cancellable: false,
    },
    async () => {
      const result = analyze(diff);
      const message = format(result);

      // 4. Write into the SCM input box
      repo.inputBox.value = message;

      vscode.window.showInformationMessage(
        `Commit message generated: "${message.split("\n")[0]}"`
      );
    }
  );
}
