import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*/pull-requests/*"],
  run_at: "document_idle",
};

export {};

let originalCommitMessage = "";

function handleTextareaInput(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  const commitMessage = textarea.value;
  console.log("[plasmo] Commit message:", commitMessage);
}

function clearCommitMessage(textarea: HTMLTextAreaElement) {
  originalCommitMessage = textarea.value;
  console.log("[plasmo] Original commit message:", originalCommitMessage);
  textarea.value = "";
  // Dispatching the input event ensures that any event listeners or bindings (e.g., React's onChange) are triggered,
  // keeping the application state in sync with the DOM.
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  console.log("[plasmo] Cleared commit message.");
}

function findBitbucketElements(): { modal: HTMLElement | null; textarea: HTMLTextAreaElement | null } {
  const textarea = document.querySelector(
    'textarea[name="merge-dialog-commit-message-textfield"]',
  ) as HTMLTextAreaElement | null;
  const modal = textarea?.closest('section[role="dialog"]') as HTMLElement | null;

  return { modal, textarea };
}

const observer = new MutationObserver(() => {
  const { modal, textarea } = findBitbucketElements();

  if (modal && textarea && !modal.dataset.opened) {
    clearCommitMessage(textarea);
    textarea.addEventListener("input", handleTextareaInput);
    modal.dataset.opened = "true";
  }
});

observer.observe(document.body, { childList: true, subtree: true });
