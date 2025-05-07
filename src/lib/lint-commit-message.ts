import commitlintConfig from "@commitlint/config-conventional";

import { findJiraId } from "~utils/find-jira-id";

export function lintCommitMessage(message: string): {
  isValid: boolean;
  errors: string[];
} {
  const trimmed = message.trim();
  const description = trimmed.split(": ")[1];
  const jiraId = findJiraId(trimmed);

  if (!trimmed) {
    return {
      isValid: false,
      errors: ["Message cannot be empty."],
    };
  }

  const match = trimmed.match(/^([a-z]+)\((.+)\): .+/);
  if (!match) {
    return {
      isValid: false,
      errors: ["Format must be: type(scope): description"],
    };
  }

  const [_, type, scope] = match;

  if (!/^[a-z0-9\-]+$/.test(scope)) {
    return {
      isValid: false,
      errors: ["Scope must be in kebab-case. Example: test-md"],
    };
  }

  const allowedTypes = commitlintConfig.rules["type-enum"]?.[2] || [];

  if (!allowedTypes.includes(type)) {
    return {
      isValid: false,
      errors: [`\"${type}\" is not a valid type. Allowed types: feat, fix, chore, etc.`],
    };
  }

  if (/[A-Z]/.test(type)) {
    return {
      isValid: false,
      errors: ["Type must be a valid type and in lowercase, such as feat, fix, chore."],
    };
  }

  if (!description) {
    return {
      isValid: false,
      errors: ["Provide a description."],
    };
  }

  if (/^[A-Z]/.test(description.trim())) {
    return {
      isValid: false,
      errors: ["Start with a lowercase letter. Example: add button"],
    };
  }

  if (/[.!?]$/.test(description.trim())) {
    return {
      isValid: false,
      errors: ["No ending punctuation. Example: add button"],
    };
  }

  if (jiraId && !/\[[A-Z]+-\d+\]$/.test(trimmed)) {
    return {
      isValid: false,
      errors: ["Jira ID must be at the end in square brackets. Example: [PROJ-1234]."],
    };
  }

  return { isValid: true, errors: [] };
}
