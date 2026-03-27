/**
 * analyzer.ts
 *
 * Analyzes staged Git diff and returns structured commit info.
 * This module is designed to be swapped with an AI-powered version (e.g. Groq).
 *
 * To add AI support: implement AnalyzerResult using the same interface
 * and replace the `analyzeWithRules` export with your AI call.
 */

export type CommitType =
  | "feat"
  | "fix"
  | "docs"
  | "refactor"
  | "chore"
  | "style"
  | "test";

export interface AnalyzerResult {
  type: CommitType;
  scope: string | null;
  description: string;
  body: string | null;
}

interface DiffFile {
  path: string;
  isNew: boolean;
  isDeleted: boolean;
  content: string;
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Rule-based diff analyzer.
 * Replace or wrap this function to plug in an AI backend.
 */
export function analyze(diff: string): AnalyzerResult {
  const files = parseDiffFiles(diff);

  if (files.length === 0) {
    return {
      type: "chore",
      scope: null,
      description: "update files",
      body: null,
    };
  }

  const type = detectType(files, diff);
  const scope = detectScope(files);
  const description = buildDescription(files, type, diff);
  const body = files.length > 1 ? buildBody(files) : null;

  return { type, scope, description, body };
}

// ─── Diff parser ─────────────────────────────────────────────────────────────

function parseDiffFiles(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  // Each file block starts with "diff --git a/... b/..."
  const blocks = diff.split(/^diff --git /m).filter(Boolean);

  for (const block of blocks) {
    const pathMatch = block.match(/^a\/.+? b\/(.+)/);
    if (!pathMatch) continue;

    const path = pathMatch[1].trim();
    const isNew = /^new file mode/m.test(block);
    const isDeleted = /^deleted file mode/m.test(block);

    files.push({ path, isNew, isDeleted, content: block });
  }

  return files;
}

// ─── Type detection ───────────────────────────────────────────────────────────

function detectType(files: DiffFile[], rawDiff: string): CommitType {
  const paths = files.map((f) => f.path.toLowerCase());
  const diffLower = rawDiff.toLowerCase();

  // test files
  if (paths.some(isTestFile)) return "test";

  // docs
  if (paths.every(isDocFile)) return "docs";

  // package / config / CI
  if (paths.every(isConfigFile)) return "chore";

  // style-only (CSS / SCSS / Less / styling tokens)
  if (paths.every(isStyleFile)) return "style";

  // bug fix keywords in diff hunks
  if (hasBugFixPattern(diffLower)) return "fix";

  // new files → feature
  if (files.some((f) => f.isNew)) return "feat";

  // refactor patterns
  if (hasRefactorPattern(diffLower)) return "refactor";

  return "feat";
}

function isTestFile(p: string): boolean {
  return (
    p.includes("test") ||
    p.includes("spec") ||
    p.includes("__tests__") ||
    /\.(test|spec)\.[jt]sx?$/.test(p)
  );
}

function isDocFile(p: string): boolean {
  return /\.(md|mdx|rst|txt)$/.test(p) || p.startsWith("docs/");
}

function isConfigFile(p: string): boolean {
  return (
    /^(package\.json|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|\.npmrc)$/.test(
      p.split("/").pop() ?? ""
    ) ||
    /\.(json|yaml|yml|toml|ini|env|config\.[jt]s)$/.test(p) ||
    p.includes(".github/") ||
    p.includes(".circleci/")
  );
}

function isStyleFile(p: string): boolean {
  return /\.(css|scss|sass|less|styl)$/.test(p);
}

function hasBugFixPattern(diff: string): boolean {
  return /\b(fix|bug|error|crash|exception|issue|broken|wrong|incorrect|typo)\b/.test(
    diff
  );
}

function hasRefactorPattern(diff: string): boolean {
  return /\b(refactor|rename|move|extract|split|merge|reorganize|simplify|cleanup|clean up)\b/.test(
    diff
  );
}

// ─── Scope detection ──────────────────────────────────────────────────────────

function detectScope(files: DiffFile[]): string | null {
  if (files.length === 0) return null;

  // Single file → use its directory or filename stem
  if (files.length === 1) {
    return scopeFromPath(files[0].path);
  }

  // Multiple files → find longest common directory prefix
  const dirs = files.map((f) => dirOf(f.path));
  const common = longestCommonPrefix(dirs);

  if (common && common !== "." && common !== "") {
    return sanitizeScope(common.replace(/\/$/, "").split("/").pop() ?? common);
  }

  return null;
}

function scopeFromPath(filePath: string): string | null {
  const parts = filePath.split("/");
  if (parts.length >= 2) {
    // prefer the immediate parent directory
    const dir = parts[parts.length - 2];
    if (dir && dir !== "." && dir !== "src") {
      return sanitizeScope(dir);
    }
  }
  // fallback: filename without extension
  const base = parts[parts.length - 1].replace(/\.[^.]+$/, "");
  return sanitizeScope(base);
}

function dirOf(filePath: string): string {
  const idx = filePath.lastIndexOf("/");
  return idx > 0 ? filePath.slice(0, idx + 1) : "";
}

function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return "";
  let prefix = strs[0];
  for (const s of strs.slice(1)) {
    while (!s.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}

function sanitizeScope(s: string): string | null {
  const cleaned = s.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
  return cleaned.length > 0 ? cleaned : null;
}

// ─── Description builder ──────────────────────────────────────────────────────

function buildDescription(
  files: DiffFile[],
  type: CommitType,
  diff: string
): string {
  // Try to extract meaningful function/class names from added lines
  const addedLines = diff
    .split("\n")
    .filter((l) => l.startsWith("+") && !l.startsWith("+++"));

  const symbol = extractPrimarySymbol(addedLines);

  if (symbol) {
    switch (type) {
      case "feat":
        return `add ${symbol}`;
      case "fix":
        return `fix ${symbol}`;
      case "refactor":
        return `refactor ${symbol}`;
      case "test":
        return `add tests for ${symbol}`;
      default:
        break;
    }
  }

  // Fallback: use file names
  const names = files
    .slice(0, 3)
    .map((f) => f.path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? f.path)
    .join(", ");

  const suffix = files.length > 3 ? ` and ${files.length - 3} more` : "";

  switch (type) {
    case "feat":
      return `add ${names}${suffix}`;
    case "fix":
      return `fix issues in ${names}${suffix}`;
    case "docs":
      return `update ${names}${suffix}`;
    case "chore":
      return `update ${names}${suffix}`;
    case "style":
      return `update styles in ${names}${suffix}`;
    case "test":
      return `add tests for ${names}${suffix}`;
    case "refactor":
      return `refactor ${names}${suffix}`;
  }
}

function extractPrimarySymbol(addedLines: string[]): string | null {
  for (const line of addedLines) {
    // TypeScript / JavaScript function declarations
    const fnMatch = line.match(
      /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
    );
    if (fnMatch) return fnMatch[1];

    // Arrow function / const assignment
    const arrowMatch = line.match(
      /(?:export\s+)?const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/
    );
    if (arrowMatch) return arrowMatch[1];

    // Class declaration
    const classMatch = line.match(/(?:export\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (classMatch) return classMatch[1];

    // Python def
    const pyMatch = line.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    if (pyMatch) return pyMatch[1];
  }
  return null;
}

// ─── Body builder ─────────────────────────────────────────────────────────────

function buildBody(files: DiffFile[]): string {
  const lines = files.map((f) => {
    if (f.isNew) return `- add ${f.path}`;
    if (f.isDeleted) return `- remove ${f.path}`;
    return `- update ${f.path}`;
  });
  return lines.join("\n");
}
