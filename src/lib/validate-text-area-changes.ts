import { findMergeButton } from "~utils/find-merge-button";

import { lintCommitMessage } from "./lint-commit-message";

export function setupValidation(textarea: HTMLTextAreaElement, modal: HTMLElement) {
  // Create error message element
  const errorElement = document.createElement("div");
  errorElement.className = "bcc-lint-error-message";
  errorElement.style.display = "none";
  textarea.insertAdjacentElement("afterend", errorElement);

  const validate = () => {
    const { isValid, errors } = lintCommitMessage(textarea.value);

    // Update error message
    textarea.style.borderColor = isValid ? "" : "var(--ds-border-warning)";
    errorElement.textContent = errors.join(" ");
    errorElement.style.display = isValid ? "none" : "block";

    // Update merge button visibility
    const mergeButton = findMergeButton(modal);
    if (mergeButton) {
      mergeButton.style.display = isValid ? "" : "none";
    }
  };

  textarea.addEventListener("input", validate);
  validate(); // Run initial validation
}
