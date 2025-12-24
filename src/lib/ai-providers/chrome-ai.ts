import "~types/chrome-ai.d";

export async function generateWithChromeAI(prompt: string): Promise<string | null> {
  if (typeof LanguageModel === "undefined") {
    return null;
  }

  const availability = await LanguageModel.availability();
  if (availability !== "available") {
    return null;
  }

  const session = await LanguageModel.create();
  try {
    const result = await session.prompt(prompt);
    return result?.trim() ?? null;
  } finally {
    session.destroy();
  }
}
