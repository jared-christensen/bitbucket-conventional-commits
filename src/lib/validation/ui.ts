// Validation UI: error display for commit message linting

import { lintCommitMessage } from "./lint";

// Module-level state to track if Generate has been clicked
let validationEnabled = false;
let listenerAttached = false;

function attachGenerateClickListener() {
  if (listenerAttached) return;
  listenerAttached = true;

  document.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).classList.contains("bcc-generate-commit-message")) {
      validationEnabled = true;
    }
  });
}

export function validateTextAreaChanges(textarea: HTMLTextAreaElement, errorElement: HTMLElement) {
  attachGenerateClickListener();

  textarea.addEventListener("input", () => {
    if (!validationEnabled) return;

    const { isValid, errors } = lintCommitMessage(textarea.value);

    textarea.style.borderColor = isValid ? "" : "var(--ds-border-warning)";
    errorElement.textContent = errors.join(" ");
    errorElement.style.display = isValid ? "none" : "block";
  });
}
