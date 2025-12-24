import { Storage } from "@plasmohq/storage";

import type { Options } from "~schema/options-schema";

import { generateWithChromeAI } from "./ai-providers/chrome-ai";
import { generateWithOpenAI } from "./ai-providers/openai";
import { buildPrompt } from "./build-prompt";

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
  const provider = options?.aiProvider ?? "chrome";
  const prompt = buildPrompt(textareaValue, prTitle, prDescription);

  const appendJiraId = (result: string | null) =>
    result && jiraId ? `${result}\n${jiraId}` : result;

  if (provider === "chrome") {
    const result = await generateWithChromeAI(prompt);
    if (result) {
      return appendJiraId(result);
    }
    throw new Error("Chrome AI not available. Check Chrome AI settings.");
  }

  if (!options?.apiKey) {
    throw new Error("No OpenAI API key configured.");
  }
  const result = await generateWithOpenAI(prompt, options.apiKey);
  return appendJiraId(result);
}
