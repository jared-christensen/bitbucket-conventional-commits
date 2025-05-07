import { Storage } from "@plasmohq/storage";

import type { Options } from "~schema/options-schema";

export async function generateCommitMessage({
  textareaValue,
  prTitle,
  prDescription,
  jiraId,
}: {
  textareaValue: string;
  prTitle: string;
  prDescription: string;
  jiraId: string | null;
}): Promise<string | null> {
  const storage = new Storage();
  const options = await storage.get<Options>("options");

  if (!options?.apiKey) {
    throw new Error("OpenAI API key not found");
  }

  const prompt = `
  You are a Conventional Commit expert generating clean, standards-compliant messages.

  Your task is to generate a single, well-structured Conventional Commit message based on the pull request details below. Prioritize user comments above all else. Use the description only if user comments lack context. Use the PR title only as a last resort.

  Format:
  type(scope): description [Jira ID, if present]

  Rules:
  - Use a valid type: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
  - Scope must be relevant and in kebab-case (e.g., ui-button); if no clear scope, use empty parentheses in the message (e.g., fix(): description)
  - Start the description with a lowercase present-tense verb (e.g., add, fix, update, remove)
  - Use plain, easy-to-understand language. Write like you're explaining the change to a teammate on Slack.
  - Do not end the message with a period
  - Keep the entire message strictly under 100 characters. Do not exceed this limit under any circumstances.
  - Be specific; avoid vague terms like "stuff" or "changes"
  - If changes cover multiple types (e.g., fix and refactor), combine them (e.g., fix/refactor(scope): description)
  - If a Jira ID is present, add it at the end in square brackets (e.g., [PROJ-1234]) with no punctuation after

  User Comments:
  ${textareaValue}

  Pull Request Title:
  ${prTitle}

  Jira ID:
  ${jiraId}

  Pull Request Description:
  ${prDescription}

  Respond with the commit message only. No extra text or explanations.
  ---
  ❌ Bad examples (do not follow these):
  - "This fixes a bunch of things." ← vague, lacks type and scope
  - "fix: updated the button to be better." ← past tense, not kebab-case, ends in a period
  - "add login feature [PROJ-1234]" ← missing type/scope format
  - "fix(login-button): added validation." ← past tense, ends in period
  - "refactor(): improvements to the whole codebase" ← vague description
  - "feat(ui-button): add long explanation of changes that definitely goes over the 100 character limit" ← too long
  ---
  ✅ Good examples:
  - fix(auth-modal): prevent double submit on login [BRAVO-421]
  - feat(user-settings): add dark mode toggle [DESIGN-122]
  - refactor(): simplify API response handling
  - docs(readme): update contributing section
  - test(button): add accessibility tests for keyboard nav
  ---
  `.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 40,
    }),
  });

  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() ?? null;
}
