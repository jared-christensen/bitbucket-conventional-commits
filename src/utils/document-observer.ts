import { findModal } from "./find-modal";

export function documentObserver(handleModalInitialization: (modal: HTMLElement) => void) {
  const mergeTextareaSelector = 'textarea[name="merge-dialog-commit-message-textfield"]';

  const observer = new MutationObserver(() => {
    const modal = findModal();
    // Only act on modals that contain the merge commit textarea
    if (modal && !modal.dataset.bccInitialized && modal.querySelector(mergeTextareaSelector)) {
      handleModalInitialization(modal);
      modal.dataset.bccInitialized = "true";
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
