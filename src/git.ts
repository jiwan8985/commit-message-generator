import * as vscode from "vscode";

interface GitExtension {
  getAPI(version: 1): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
}

export interface Repository {
  inputBox: { value: string };
  diff(staged: boolean): Promise<string>;
}

export async function getGitRepo(): Promise<Repository | null> {
  const gitExtension = vscode.extensions.getExtension<GitExtension>("vscode.git");

  if (!gitExtension) {
    vscode.window.showErrorMessage("Git Commit Wizard: VS Code Git extension not found.");
    return null;
  }

  const git = gitExtension.isActive
    ? gitExtension.exports.getAPI(1)
    : (await gitExtension.activate()).getAPI(1);

  if (!git.repositories.length) {
    vscode.window.showWarningMessage(
      "Git Commit Wizard: No Git repository found in the workspace."
    );
    return null;
  }

  return git.repositories[0];
}
