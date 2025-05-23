export function buildPrompt(textareaValue: string, prTitle: string, prDescription: string): string {
  return `
  You are a Conventional Commit expert. Generate a one-line Conventional Commit message based on the user’s input and PR details.

  Use this format:
  type(scope): description

  Guidelines:
  - Only return the commit message — do not include explanations or a Jira ID
  - Use valid types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
  - Use a meaningful scope in kebab-case (e.g. user-settings, api-client)
  - If no specific scope applies, omit the scope entirely (e.g. chore: update tooling)
  - Start the description with a lowercase present-tense verb
  - Be clear, concise (<100 chars), and changelog-friendly
  - The message should make sense on its own in a changelog

  User's Input:
  ${textareaValue.trim()}

  PR Title:
  ${prTitle.trim()}

  PR Description:
  ${prDescription.trim()}

  `.trim();
}
