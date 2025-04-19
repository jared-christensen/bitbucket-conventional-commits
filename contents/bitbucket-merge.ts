import commitlintConfig from "@commitlint/config-conventional";
import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*/pull-requests/*"],
  run_at: "document_idle",
};

export {};

let originalCommitMessage = "";

const COMMIT_REGEX = /^(\w+)(\([\w\-]+\))?: .+/;

function lintCommitMessage(message: string): {
  isValid: boolean;
  errors: string[];
} {
  const trimmed = message.trim();

  const match = trimmed.match(COMMIT_REGEX);
  if (!match) {
    return {
      isValid: false,
      errors: ["Commit message must match format: type(scope): description"],
    };
  }

  const type = match[1];
  const allowedTypes = commitlintConfig.rules["type-enum"]?.[2];

  if (!allowedTypes || !Array.isArray(allowedTypes)) {
    return {
      isValid: false,
      errors: ["Cannot load allowed commit types from config"],
    };
  }

  if (!allowedTypes.includes(type)) {
    return {
      isValid: false,
      errors: [`"${type}" is not a valid commit type.`],
    };
  }

  return { isValid: true, errors: [] };
}

function validateCommitMessage(commitMessage: string, textarea: HTMLTextAreaElement): boolean {
  const { isValid, errors } = lintCommitMessage(commitMessage);
  const errorMessageElement = document.getElementById("commit-message-error");

  if (!isValid) {
    console.log("[plasmo] Commit message failed linting:", errors);
    textarea.style.border = "var(--ds-border-width) solid var(--ds-border-danger)";
    textarea.style.borderRadius = "var(--ds-border-radius)";

    if (errorMessageElement) {
      errorMessageElement.textContent = errors.join(" ");
      errorMessageElement.style.display = "block";
    }
    return false;
  } else {
    console.log("[plasmo] Commit message is valid.");
    textarea.style.border = ""; // Reset border on validation success
    textarea.style.borderRadius = "";

    if (errorMessageElement) {
      errorMessageElement.style.display = "none";
    }
    return true;
  }
}

function handleTextareaInput(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  const commitMessage = textarea.value;
  console.log("[plasmo] Commit message:", commitMessage);

  validateCommitMessage(commitMessage, textarea);
}

function clearCommitMessage(textarea: HTMLTextAreaElement) {
  originalCommitMessage = textarea.value;
  textarea.value = "";
  // Dispatching the input event ensures that any event listeners or bindings (e.g., React's onChange) are triggered,
  // keeping the application state in sync with the DOM.
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function findBitbucketElements(): { modal: HTMLElement | null; textarea: HTMLTextAreaElement | null } {
  const textarea = document.querySelector(
    'textarea[name="merge-dialog-commit-message-textfield"]',
  ) as HTMLTextAreaElement | null;
  const modal = textarea?.closest('section[role="dialog"]') as HTMLElement | null;

  return { modal, textarea };
}

function createErrorMessageElement() {
  const errorMessageElement = document.createElement("div");
  errorMessageElement.id = "commit-message-error";
  errorMessageElement.style.font = "var(--ds-font-body-UNSAFE_small)";
  errorMessageElement.style.color = "var(--ds-text-danger)";
  errorMessageElement.style.marginBlockStart = "var(--ds-space-050)";
  errorMessageElement.style.display = "none";
  return errorMessageElement;
}

const observer = new MutationObserver(() => {
  const { modal, textarea } = findBitbucketElements();

  if (modal && textarea && !modal.dataset.opened) {
    clearCommitMessage(textarea);
    textarea.addEventListener("input", handleTextareaInput);
    modal.dataset.opened = "true";

    const errorMessageElement = createErrorMessageElement();
    textarea.insertAdjacentElement("afterend", errorMessageElement);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
