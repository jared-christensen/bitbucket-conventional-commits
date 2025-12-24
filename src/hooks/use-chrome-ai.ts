import { useState, useEffect } from "react";

import "~types/chrome-ai.d";

type ChromeAIStatus = "checking" | "unavailable" | "not-enabled" | "downloadable" | "downloading" | "available";

export function useChromeAI() {
  const [status, setStatus] = useState<ChromeAIStatus>("checking");
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const checkAvailability = async () => {
    if (typeof LanguageModel === "undefined") {
      setStatus("not-enabled");
      return;
    }

    try {
      const availability = await LanguageModel.availability();
      setStatus(availability === "unavailable" ? "unavailable" : availability);
    } catch {
      setStatus("unavailable");
    }
  };

  useEffect(() => {
    checkAvailability();
  }, []);

  const download = async () => {
    if (typeof LanguageModel === "undefined") return;

    setStatus("downloading");
    try {
      const session = await LanguageModel.create();
      session.destroy();
      setStatus("available");
    } catch {
      checkAvailability();
    }
  };

  const test = async () => {
    try {
      const session = await LanguageModel.create();
      await session.prompt("Say hi");
      session.destroy();
      setTestResult("success");
    } catch {
      setTestResult("error");
    }
  };

  return {
    status,
    testResult,
    download,
    test,
    clearTestResult: () => setTestResult(null),
  };
}
