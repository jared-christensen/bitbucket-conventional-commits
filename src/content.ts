import type { PlasmoCSConfig } from "plasmo";

import { generateAndSetCommitMessage } from "~lib/generate-and-set-commit-message";
import { hideMergeButtonIfInvalid } from "~lib/hide-merge-button-if-invalid";
import { validateTextAreaChanges } from "~lib/validate-text-area-changes";
import { createErrorMessageElement } from "~utils/create-error-message-element";
import { createGenerateButton } from "~utils/create-generate-button";
import { documentObserver } from "~utils/document-observer";
import { setTextAreaValue } from "~utils/set-textarea-value";

import "~styles/content.css";

import { findTextArea } from "~utils/find-text-area";

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*/pull-requests/*"],
  run_at: "document_end",
};

export {};

documentObserver((modal: HTMLElement) => {
  const textarea = findTextArea();

  hideMergeButtonIfInvalid(modal, textarea);

  if (textarea) {
    createGenerateButton(textarea, generateAndSetCommitMessage);
    createErrorMessageElement(textarea);
    validateTextAreaChanges(textarea);

    setTextAreaValue("");
  }
});
