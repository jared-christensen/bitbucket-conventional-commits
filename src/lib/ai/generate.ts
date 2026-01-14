// Main commit message generation logic

import { Storage } from "@plasmohq/storage";

import type { Options } from "~schema/options-schema";

import { generateWithChromeAI, generateWithOpenAI } from "./providers";
import { buildPrompt } from "./prompt";

// Post-process AI output to fix common issues
function cleanupCommitMessage(message: string, jiraId: string | null): string {
  let text = message.trim();

  // Strip common AI artifacts
  text = text.replace(/^```\n?|```$/g, ""); // code blocks
  text = text.replace(/^["']|["']$/g, ""); // quotes
  text = text.replace(/^commit message:\s*/i, ""); // prefix

  const lines = text.split("\n");
  let firstLine = lines[0];

  // Remove Jira ID from subject line (we'll add to footer)
  if (jiraId) {
    firstLine = firstLine.replace(new RegExp(`\\s*${jiraId}\\s*`, "g"), " ").trim();
    // Clean up any double spaces left behind
    firstLine = firstLine.replace(/\s{2,}/g, " ");
  }

  // Fix space before scope: "feat (scope):" → "feat(scope):"
  firstLine = firstLine.replace(/^([a-zA-Z]+)\s+\(/, "$1(");

  // Fix missing colon after scope: "feat(scope) desc" → "feat(scope): desc"
  firstLine = firstLine.replace(/^([a-zA-Z]+\([^)]+\)!?)\s+(?!:)/, "$1: ");

  // Match the conventional commit format: type(scope): description or type: description
  const match = firstLine.match(/^([a-zA-Z]+)(\([^)]+\))?(!)?(:\s*)(.*)$/);
  if (match) {
    const [, type, scope = "", bang = "", , description] = match;

    // Normalize scope to kebab-case
    let cleanScope = scope;
    if (scope) {
      const scopeContent = scope.slice(1, -1);
      const kebabScope = scopeContent.toLowerCase().trim().replace(/\s+/g, "-");
      cleanScope = `(${kebabScope})`;
    }

    // Normalize: lowercase type, lowercase description start, remove ending punctuation
    const cleanDesc = description.charAt(0).toLowerCase() + description.slice(1);
    const finalDesc = cleanDesc.replace(/[.!?]+$/, "");

    firstLine = `${type.toLowerCase()}${cleanScope}${bang}: ${finalDesc}`;
  }

  lines[0] = firstLine;
  return lines.join("\n");
}

export async function generateCommitMessage({
  textareaValue,
  prTitle,
  prDescription,
  jiraId,
  jiraTitle,
}: {
  textareaValue: string;
  prTitle: string;
  prDescription: string;
  jiraId: string | null;
  jiraTitle: string;
}): Promise<string | null> {
  const storage = new Storage();
  const options = await storage.get<Options>("options");

  // Backwards compatibility: if user has an API key but no explicit provider choice,
  // they were using the extension before Chrome AI was added - default to OpenAI
  const provider = options?.aiProvider ?? (options?.apiKey ? "openai" : "chrome");
  const prompt = buildPrompt(textareaValue, prTitle, prDescription, jiraTitle);

  // Clean up and append Jira ID to footer
  const processResult = (result: string | null) => {
    if (!result) return null;
    const cleaned = cleanupCommitMessage(result, jiraId);
    return jiraId && !cleaned.includes(jiraId) ? `${cleaned}\n\n${jiraId}` : cleaned;
  };

  if (provider === "chrome") {
    const result = await generateWithChromeAI(prompt);
    if (result) {
      return processResult(result);
    }
    throw new Error("Chrome AI not available. Check Chrome AI settings.");
  }

  if (!options?.apiKey) {
    throw new Error("No OpenAI API key configured.");
  }
  const result = await generateWithOpenAI(prompt, options.apiKey);
  return processResult(result);
}
