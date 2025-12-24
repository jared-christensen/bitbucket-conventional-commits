import { useState } from "react";

export function useOpenAI() {
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const test = async (apiKey: string) => {
    if (!apiKey) return;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say hello" }],
          temperature: 0.3,
          max_tokens: 10,
        }),
      });
      setTestResult(response.ok ? "success" : "error");
    } catch {
      setTestResult("error");
    }
  };

  return {
    testResult,
    test,
    clearTestResult: () => setTestResult(null),
  };
}
