import type { PlasmoCSConfig } from "plasmo";

import { generateAndSetCommitMessage } from "~lib/generate-and-set-commit-message";
import { setupValidation } from "~lib/validate-text-area-changes";
import { createGenerateButton } from "~utils/create-generate-button";
import { documentObserver } from "~utils/document-observer";
import { findTextArea } from "~utils/find-text-area";
import { setTextAreaValue } from "~utils/set-textarea-value";

import "~styles/content.css";

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*"],
  run_at: "document_end",
};

export {};

documentObserver((modal: HTMLElement) => {
  const textarea = findTextArea();

  if (textarea) {
    textarea.placeholder = "Describe what you changed and why, then hit Generate";
    createGenerateButton(textarea, generateAndSetCommitMessage);
    setupValidation(textarea, modal);
    setTextAreaValue("");
  }
});
