// MutationObserver for detecting Bitbucket merge modal

import { findModal } from "./dom";

export function documentObserver(handleModalInitialization: () => void) {
  const mergeTextareaSelector = 'textarea[name="merge-dialog-commit-message-textfield"]';

  const observer = new MutationObserver(() => {
    const modal = findModal();

    if (modal && !modal.dataset.bccInitialized && modal.querySelector(mergeTextareaSelector)) {
      handleModalInitialization();
      modal.dataset.bccInitialized = "true";
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
