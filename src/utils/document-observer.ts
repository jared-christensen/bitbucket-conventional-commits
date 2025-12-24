import { findModal } from "./find-modal";

export function documentObserver(handleModalInitialization: (modal: HTMLElement) => void) {
  const mergeTextareaSelector = 'textarea[name="merge-dialog-commit-message-textfield"]';

  const observer = new MutationObserver(() => {
    const modal = findModal();
    const textarea = modal?.querySelector(mergeTextareaSelector);
    const hasOurUI = modal?.querySelector(".bcc-generate-commit-message");

    // Initialize if modal has textarea but our UI is missing (e.g., after switching from fast-forward)
    if (modal && textarea && !hasOurUI) {
      handleModalInitialization(modal);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
