import { Storage } from "@plasmohq/storage";

import type { Options } from "~schema/options-schema";

import { buildPrompt } from "./build-prompt";

const model = "gpt-3.5-turbo";

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

  const prompt = buildPrompt(textareaValue, prTitle, prDescription);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error?.message || `OpenAI API error: ${response.status}`);
  }

  const json = await response.json();
  const commitMessage = json.choices?.[0]?.message?.content?.trim() ?? null;
  return commitMessage && jiraId ? `${commitMessage}\n${jiraId}` : commitMessage;
}
