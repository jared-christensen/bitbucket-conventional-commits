import type { PlasmoCSConfig } from "plasmo";

import { generateAndSetCommitMessage } from "~lib/ai/actions";
import { setupValidation } from "~lib/validation/ui";
import { createErrorMessageElement, createGenerateButton, findTextArea, setTextAreaValue } from "~utils/dom";
import { documentObserver } from "~utils/observers";

import "~styles/content.css";

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*"],
  run_at: "document_end",
};

export {};

documentObserver(() => {
  const textarea = findTextArea();

  if (textarea) {
    textarea.placeholder = "Describe what you changed and why before clicking Generate for a better message.";
    setTextAreaValue("");
    createGenerateButton(textarea, generateAndSetCommitMessage);
    const errorElement = createErrorMessageElement(textarea);
    setupValidation(textarea, errorElement);
  }
});
