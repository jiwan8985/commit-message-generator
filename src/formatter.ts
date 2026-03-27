/**
 * formatter.ts
 *
 * Formats an AnalyzerResult into a Conventional Commits string.
 * Spec: https://www.conventionalcommits.org/en/v1.0.0/
 *
 * Pattern: <type>[optional scope]: <description>
 *          [optional body]
 */

import type { AnalyzerResult } from "./analyzer.js";

export interface FormatOptions {
  /** Max characters for the subject line (type + scope + description). Default 72. */
  maxSubjectLength?: number;
  /** Include multi-file body listing. Default true. */
  includeBody?: boolean;
}

/**
 * Converts an AnalyzerResult into a ready-to-use commit message string.
 */
export function format(
  result: AnalyzerResult,
  options: FormatOptions = {}
): string {
  const { maxSubjectLength = 72, includeBody = true } = options;

  const header = buildHeader(result, maxSubjectLength);

  if (includeBody && result.body) {
    return `${header}\n\n${result.body}`;
  }

  return header;
}

function buildHeader(result: AnalyzerResult, maxLength: number): string {
  const scope = result.scope ? `(${result.scope})` : "";
  const prefix = `${result.type}${scope}: `;

  // Truncate description if the full subject line would exceed maxLength
  const maxDescLength = maxLength - prefix.length;
  const description =
    result.description.length > maxDescLength
      ? result.description.slice(0, maxDescLength - 1) + "…"
      : result.description;

  return `${prefix}${description}`;
}
