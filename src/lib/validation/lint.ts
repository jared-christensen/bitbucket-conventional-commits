// Commit message linting against conventional commit format

import commitlintConfig from "@commitlint/config-conventional";

import { findJiraId } from "~utils/pr-context";

export function lintCommitMessage(message: string): {
  isValid: boolean;
  errors: string[];
  severity: "error" | "warning" | "none";
} {
  const trimmed = message.trim();
  const jiraId = findJiraId(trimmed);

  // === ERRORS (block merge) ===

  if (!trimmed) {
    return { isValid: false, errors: ["Add a commit message."], severity: "error" };
  }

  // Check for ticket prefix (e.g. "ECHO-1046: feat...")
  if (/^[A-Z]+-\d+/.test(trimmed)) {
    return { isValid: false, errors: ["Move the ticket to the end, not the start."], severity: "error" };
  }

  // Check for missing colon after scope (e.g. "feat(scope) description")
  if (/^[a-z]+\([^)]+\)\s+\w/.test(trimmed)) {
    return { isValid: false, errors: ["Add a colon after the scope: type(scope): description"], severity: "error" };
  }

  // Check for space before scope (e.g. "feat (scope):")
  if (/^[a-z]+\s+\(/.test(trimmed)) {
    return { isValid: false, errors: ["Remove the space before the scope: type(scope):"], severity: "error" };
  }

  // Check for uppercase type (e.g. "FEAT:" or "Feat:")
  if (/^[A-Z][a-zA-Z]*(\(|:)/.test(trimmed)) {
    return { isValid: false, errors: ["Type should be lowercase (e.g. feat, fix, chore)."], severity: "error" };
  }

  // Check for scope that isn't kebab-case
  const scopeMatch = trimmed.match(/^[a-z]+\(([^)]+)\):/);
  if (scopeMatch && !/^[a-z0-9-]+$/.test(scopeMatch[1])) {
    return { isValid: false, errors: ["Scope should be kebab-case (e.g. user-auth)."], severity: "error" };
  }

  // Regex enforces: lowercase type, optional kebab-case scope, description
  const match = trimmed.match(/^([a-z]+)(\(([a-z0-9-]+)\))?: .+/);
  if (!match) {
    return { isValid: false, errors: ["Try: type(scope): description or type: description"], severity: "error" };
  }

  const [, type] = match;
  const description = trimmed.split(": ").slice(1).join(": ");

  const allowedTypes = commitlintConfig.rules["type-enum"]?.[2] || [];
  if (!allowedTypes.includes(type)) {
    return { isValid: false, errors: [`"${type}" isn't a standard type. Try feat, fix, chore, etc.`], severity: "error" };
  }

  if (!description) {
    return { isValid: false, errors: ["Add a description after the colon."], severity: "error" };
  }

  // === WARNINGS (tips only, don't block merge) ===

  if (/^[A-Z]/.test(description)) {
    return { isValid: false, errors: ["Lowercase descriptions are preferred."], severity: "warning" };
  }

  if (/[.!?]$/.test(description)) {
    return { isValid: false, errors: ["Skip the ending punctuation."], severity: "warning" };
  }

  const lines = trimmed.split("\n");
  const firstLine = lines[0];
  const footerLines = lines.slice(1);

  if (jiraId && firstLine.includes(jiraId)) {
    return { isValid: false, errors: ["Consider moving the Jira ID to the footer."], severity: "warning" };
  }

  if (jiraId && !footerLines.some((line) => line.includes(jiraId))) {
    return { isValid: false, errors: ["The Jira ID works best in the footer."], severity: "warning" };
  }

  return { isValid: true, errors: [], severity: "none" };
}
