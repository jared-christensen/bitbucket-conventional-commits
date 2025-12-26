// Main commit message generation logic

import { Storage } from "@plasmohq/storage";

import type { Options } from "~schema/options-schema";

import { generateWithChromeAI, generateWithOpenAI } from "./providers";
import { buildPrompt } from "./prompt";

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

  // Backwards compatibility: if user has an API key but no explicit provider choice,
  // they were using the extension before Chrome AI was added - default to OpenAI
  const provider = options?.aiProvider ?? (options?.apiKey ? "openai" : "chrome");
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
