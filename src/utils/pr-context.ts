// Utilities for extracting context from Bitbucket PR pages

export function getPrTitle(): string {
  const prHeader = document.querySelector('[data-testid="pr-header"] h1');
  return prHeader?.textContent?.trim() || "";
}

export function getPrDescription(): string {
  const prDescriptionElement = document.querySelector("#pull-request-description-panel");
  return prDescriptionElement?.textContent?.trim() || "";
}

/**
 * Extracts a JIRA ID from a given string.
 * A JIRA ID follows the pattern "ABC-123" (uppercase project key + number).
 */
export function findJiraId(input: string): string | null {
  const match = input.match(/[A-Z]+-\d+/);
  return match ? match[0] : null;
}
