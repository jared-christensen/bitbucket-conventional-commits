export async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error?.message || `OpenAI API error: ${response.status}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() ?? null;
}
