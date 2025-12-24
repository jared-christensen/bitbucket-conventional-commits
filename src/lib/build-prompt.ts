export function buildPrompt(textareaValue: string, prTitle: string, prDescription: string): string {
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
- Start description with a verb: add, fix, update, remove, refactor, implement, improve, handle, prevent, support, enable, disable, replace, simplify, extract, rename, move, validate, ensure, allow
- Use imperative mood ("add feature" not "added feature" or "adds feature")
- No period at the end
- Scope is optional; use kebab-case if included (e.g. user-auth, api-client)
- Keep under 72 characters total
- Be specific, not vague ("add password validation" not "update auth")

Examples:
- feat(auth): add OAuth2 login support
- fix(cart): prevent duplicate items when clicking rapidly
- refactor(api): extract validation logic into middleware
- docs: update installation instructions
- chore: upgrade webpack to v5

${textareaValue.trim() ? `User's notes (prioritize this):\n${textareaValue.trim()}\n` : ""}
PR Title: ${prTitle.trim()}
${prDescription.trim() ? `\nPR Description:\n${prDescription.trim()}` : ""}
`.trim();
}
