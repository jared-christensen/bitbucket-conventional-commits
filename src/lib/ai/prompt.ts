// Prompt builder for AI commit message generation

export function buildPrompt(textareaValue: string, prTitle: string, prDescription: string, jiraTitle?: string): string {
  const context = [
    `PR Title: ${prTitle.trim()}`,
    jiraTitle?.trim() ? `Jira Issue: ${jiraTitle.trim()}` : "",
    prDescription.trim() ? `PR Description: ${prDescription.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `
Generate a Conventional Commit message. Return ONLY the commit message, nothing else.

Format: type(scope): description

Types:
- feat: new feature or capability
- fix: bug fix
- refactor: code change that neither fixes a bug nor adds a feature
- docs: documentation only
- test: adding or updating tests
- chore: maintenance tasks, dependencies
- style: formatting, whitespace (not CSS)
- perf: performance improvement
- build: build system or external dependencies
- ci: CI configuration
- revert: reverting a previous commit

Rules:
- Type must be lowercase (feat, not Feat or FEAT)
- Description must start lowercase (add feature, not Add feature)
- Start description with an imperative verb (add, fix, update, remove, etc.)
- No period at the end
- Scope is optional; use kebab-case with no space before it: type(scope): not type (scope):
- Aim for 50 characters, never exceed 72
- Be specific, not vague ("add password validation" not "update auth")
- Do not include any Jira/ticket ID (it will be added automatically)

Examples:
- feat(auth): add OAuth2 login support
- fix(cart): prevent duplicate items when clicking rapidly
- refactor(api): extract validation logic into middleware
- feat(api)!: remove deprecated endpoints
- docs: update installation instructions
- chore: upgrade webpack to v5

${textareaValue.trim() ? `User instructions (follow these exactly — include any Jira IDs, scope, or details they mention):\n${textareaValue.trim()}\n\n` : ""}${context}
`.trim();
}
