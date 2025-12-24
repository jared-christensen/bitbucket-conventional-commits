import commitlintConfig from "@commitlint/config-conventional";

import { findJiraId } from "~utils/find-jira-id";

export function lintCommitMessage(message: string): {
  isValid: boolean;
  errors: string[];
} {
  const trimmed = message.trim();
  const jiraId = findJiraId(trimmed);

  if (!trimmed) {
    return { isValid: false, errors: ["Message cannot be empty."] };
  }

  // Regex enforces: lowercase type, optional kebab-case scope, description
  const match = trimmed.match(/^([a-z]+)(\(([a-z0-9-]+)\))?: .+/);
  if (!match) {
    return { isValid: false, errors: ["Format must be: type(scope): description"] };
  }

  const [, type, , ] = match;
  const description = trimmed.split(": ").slice(1).join(": ");

  const allowedTypes = commitlintConfig.rules["type-enum"]?.[2] || [];
  if (!allowedTypes.includes(type)) {
    return { isValid: false, errors: [`"${type}" is not a valid type. Allowed: feat, fix, chore, etc.`] };
  }

  if (!description) {
    return { isValid: false, errors: ["Provide a description."] };
  }

  if (/^[A-Z]/.test(description)) {
    return { isValid: false, errors: ["Start with a lowercase letter."] };
  }

  if (/[.!?]$/.test(description)) {
    return { isValid: false, errors: ["No ending punctuation."] };
  }

  const lines = trimmed.split("\n");
  const firstLine = lines[0];
  const footerLines = lines.slice(1);

  if (jiraId && firstLine.includes(jiraId)) {
    return { isValid: false, errors: ["Move the Jira ID to the footer, not the subject line."] };
  }

  if (jiraId && !footerLines.some((line) => line.includes(jiraId))) {
    return { isValid: false, errors: ["Jira ID must be in the footer (after the first line)."] };
  }

  return { isValid: true, errors: [] };
}
