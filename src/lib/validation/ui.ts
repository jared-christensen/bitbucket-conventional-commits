// Validation UI: error display for commit message linting

import { lintCommitMessage } from "./lint";

export function validateTextAreaChanges(textarea: HTMLTextAreaElement, errorElement: HTMLElement) {
  let validationEnabled = false;

  // Start validating after Generate is clicked
  document.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).classList.contains("bcc-generate-commit-message")) {
      validationEnabled = true;
    }
  });

  textarea.addEventListener("input", () => {
    if (!validationEnabled) return;

    const { isValid, errors } = lintCommitMessage(textarea.value);

    textarea.style.borderColor = isValid ? "" : "var(--ds-border-warning)";
    errorElement.textContent = errors.join(" ");
    errorElement.style.display = isValid ? "none" : "block";
  });
}
