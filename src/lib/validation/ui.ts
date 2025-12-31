// Validation UI: error display for commit message linting

import { findTextArea } from "~utils/dom";
import { getPrTitle } from "~utils/pr-context";

import { lintCommitMessage } from "./lint";

// Module-level state to track if Generate has been clicked
let validationEnabled = false;
let listenerAttached = false;

function attachListeners() {
  if (listenerAttached) return;
  listenerAttached = true;

  document.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).classList.contains("bcc-generate-commit-message")) {
      validationEnabled = true;
    }
  });

  // Capture phase listener to block merge with empty or invalid message
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement;
      const mergeButton = target.closest("button");

      if (mergeButton?.textContent?.trim() === "Merge") {
        const textarea = findTextArea();
        if (!textarea) return;

        const { errors, severity } = lintCommitMessage(textarea.value, getPrTitle());

        // Block on errors (structural issues), allow warnings (style issues) through
        if (severity === "error") {
          e.stopPropagation();
          e.preventDefault();

          // Show validation UI
          textarea.style.borderColor = "#EC6340";
          const errorElement = textarea.nextElementSibling?.querySelector(".bcc-lint-error-message");
          if (errorElement instanceof HTMLElement) {
            errorElement.textContent = errors.join(" ");
            errorElement.className = `bcc-lint-error-message ${severity}`;
            errorElement.style.display = "block";
          }
        }
      }
    },
    true
  ); // capture phase
}

export function setupValidation(textarea: HTMLTextAreaElement, errorElement: HTMLElement) {
  attachListeners();

  textarea.addEventListener("input", () => {
    if (!validationEnabled) return;

    const { isValid, errors, severity } = lintCommitMessage(textarea.value, getPrTitle());

    textarea.style.borderColor = isValid ? "" : severity === "error" ? "#EC6340" : "#F3AF3D";
    errorElement.textContent = errors.join(" ");
    errorElement.className = `bcc-lint-error-message ${severity}`;
    errorElement.style.display = isValid ? "none" : "block";
  });
}
