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
You are an assistant that writes high-quality Conventional Commit messages.

Your task is to generate a single, well-structured Conventional Commit message based on the pull request details below. Prioritize the pull request title and description as the main source of truth. Use commit messages only as supporting context.

Format:
type(scope): concise summary of the change [optional Jira ID at end, e.g. BRAVO-123]

Rules:
- Use a valid type: feat, fix, docs, style, refactor, perf, test, chore
- Use an optional scope in parentheses to indicate the area affected
- Start the summary with a lowercase verb (e.g., add, fix, update, remove)
- Do not end the message with a period
- Be clear and specific; avoid vague terms like "stuff" or "changes"
- If the changes cover multiple areas (e.g., fix and refactor), generate a single combined message that reflects the scope and intent

Pull Request Title:
${prTitle}

Jira ID:
${jiraId}

Pull Request Description:
${prDescription}

User Input:
${textareaValue}

Respond with only the final commit message. Do not include explanations.
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
      max_tokens: 60,
    }),
  });

  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() ?? null;
}
