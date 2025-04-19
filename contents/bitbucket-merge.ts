import commitlintConfig from "@commitlint/config-conventional";
import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*/pull-requests/*"],
  run_at: "document_idle",
};

export {};

let originalCommitMessage = "";

function lintCommitMessage(message: string): {
  isValid: boolean;
  errors: string[];
} {
  const trimmed = message.trim();

  const match = trimmed.match(/^\w+(\([\w\-]+\))?: .+/);
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

function disableMergeButton(disable: boolean) {
  const { mergeButton } = findBitbucketElements();
  if (mergeButton) {
    mergeButton.disabled = disable;
  }
}

function validateCommitMessage(commitMessage: string, textarea: HTMLTextAreaElement): boolean {
  const { isValid, errors } = lintCommitMessage(commitMessage);
  const errorMessageElement = document.getElementById("commit-message-error");

  if (!isValid) {
    textarea.style.borderColor = "var(--ds-border-danger)";

    if (errorMessageElement) {
      errorMessageElement.textContent = errors.join(" ");
      errorMessageElement.style.display = "block";
    }

    disableMergeButton(true);
    return false;
  } else {
    textarea.style.borderColor = "";

    if (errorMessageElement) {
      errorMessageElement.style.display = "none";
    }

    disableMergeButton(false);
    return true;
  }
}

function clearCommitMessage(textarea: HTMLTextAreaElement) {
  originalCommitMessage = textarea.value;
  textarea.value = "";
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function findBitbucketElements(): {
  modal: HTMLElement | null;
  textarea: HTMLTextAreaElement | null;
  mergeButton: HTMLButtonElement | null;
} {
  const textarea = document.querySelector(
    'textarea[name="merge-dialog-commit-message-textfield"]',
  ) as HTMLTextAreaElement | null;
  const modal = textarea?.closest('section[role="dialog"]') as HTMLElement | null;

  const mergeButton = modal?.querySelector('div[role="group"] button:first-of-type') as HTMLButtonElement | null;

  return { modal, textarea, mergeButton };
}

function createErrorMessageElement(textarea: HTMLTextAreaElement) {
  const errorMessageElement = document.createElement("div");
  errorMessageElement.id = "commit-message-error";
  errorMessageElement.style.font = "var(--ds-font-body-UNSAFE_small)";
  errorMessageElement.style.color = "var(--ds-text-danger)";
  errorMessageElement.style.marginBlockStart = "var(--ds-space-050)";
  errorMessageElement.style.display = "none";

  textarea.insertAdjacentElement("afterend", errorMessageElement);
  return errorMessageElement;
}

function handleTextareaInput(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  const commitMessage = textarea.value;

  validateCommitMessage(commitMessage, textarea);
}

const observer = new MutationObserver(() => {
  const { modal, textarea } = findBitbucketElements();

  if (modal && textarea && !modal.dataset.opened) {
    clearCommitMessage(textarea);
    createErrorMessageElement(textarea);
    textarea.addEventListener("input", handleTextareaInput);
    modal.dataset.opened = "true";
  }
});

observer.observe(document.body, { childList: true, subtree: true });
