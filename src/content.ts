import type { PlasmoCSConfig } from "plasmo";

import { generateAndSetCommitMessage } from "~lib/ai/actions";
import { setupValidation } from "~lib/validation/ui";
import { createErrorMessageElement, createGenerateButton, findTextArea, setTextAreaValue } from "~utils/dom";
import { documentObserver } from "~utils/observers";
import { cacheContext } from "~utils/pr-context";

import "~styles/content.css";

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*"],
  run_at: "document_end",
};

export {};

// Cache PR context early (only available on Overview tab)
cacheContext();

documentObserver(() => {
  // Re-cache whenever DOM changes (in case user navigates back to Overview)
  cacheContext();
  const textarea = findTextArea();

  if (textarea) {
    textarea.placeholder = "Add context to improve the generated message";
    setTextAreaValue("");
    createGenerateButton(textarea, generateAndSetCommitMessage);
    const errorElement = createErrorMessageElement(textarea);
    setupValidation(textarea, errorElement);
  }
});
