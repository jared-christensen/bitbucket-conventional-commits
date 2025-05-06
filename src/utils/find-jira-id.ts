/**
 * Extracts a JIRA ID from a given string.
 *
 * A JIRA ID is expected to follow the pattern "ABC-123",
 * where "ABC" is an uppercase project key and "123" is a numeric identifier.
 *
 * @param input - The string to search for a JIRA ID.
 * @returns The first JIRA ID found in the string, or null if none is found.
 */
export function findJiraId(input: string): string | null {
  const jiraIdPattern = /[A-Z]+-\d+/; // Matches patterns like "ABC-123"
  const match = input.match(jiraIdPattern);
  return match ? match[0] : null;
}
