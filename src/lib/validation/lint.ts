// Commit message linting against conventional commit format

import commitlintConfig from "@commitlint/config-conventional";

import { findJiraId } from "~utils/pr-context";

export function lintCommitMessage(message: string): {
  isValid: boolean;
  errors: string[];
} {
  const trimmed = message.trim();
  const jiraId = findJiraId(trimmed);

  if (!trimmed) {
    return { isValid: false, errors: ["Add a commit message."] };
  }

  // Check for ticket prefix (e.g. "ECHO-1046: feat...")
  if (/^[A-Z]+-\d+/.test(trimmed)) {
    return { isValid: false, errors: ["Move the ticket to the end, not the start."] };
  }

  // Check for missing colon after scope (e.g. "feat(scope) description")
  if (/^[a-z]+\([^)]+\)\s+\w/.test(trimmed)) {
    return { isValid: false, errors: ["Add a colon after the scope: type(scope): description"] };
  }

  // Check for scope that isn't kebab-case
  const scopeMatch = trimmed.match(/^[a-z]+\(([^)]+)\):/);
  if (scopeMatch && !/^[a-z0-9-]+$/.test(scopeMatch[1])) {
    return { isValid: false, errors: ["Scope should be kebab-case (e.g. user-auth)."] };
  }

  // Regex enforces: lowercase type, optional kebab-case scope, description
  const match = trimmed.match(/^([a-z]+)(\(([a-z0-9-]+)\))?: .+/);
  if (!match) {
    return { isValid: false, errors: ["Try: type(scope): description or type: description"] };
  }

  const [, type] = match;
  const description = trimmed.split(": ").slice(1).join(": ");

  const allowedTypes = commitlintConfig.rules["type-enum"]?.[2] || [];
  if (!allowedTypes.includes(type)) {
    return { isValid: false, errors: [`"${type}" isn't a standard type. Try feat, fix, chore, etc.`] };
  }

  if (!description) {
    return { isValid: false, errors: ["Add a description after the colon."] };
  }

  if (/^[A-Z]/.test(description)) {
    return { isValid: false, errors: ["Lowercase descriptions are preferred."] };
  }

  if (/[.!?]$/.test(description)) {
    return { isValid: false, errors: ["Skip the ending punctuation."] };
  }

  const lines = trimmed.split("\n");
  const firstLine = lines[0];
  const footerLines = lines.slice(1);

  if (jiraId && firstLine.includes(jiraId)) {
    return { isValid: false, errors: ["Consider moving the Jira ID to the footer."] };
  }

  if (jiraId && !footerLines.some((line) => line.includes(jiraId))) {
    return { isValid: false, errors: ["The Jira ID works best in the footer."] };
  }

  return { isValid: true, errors: [] };
}
