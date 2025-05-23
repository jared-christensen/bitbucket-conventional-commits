import { findModal } from "./find-modal";

export function documentObserver(handleModalInitialization: (modal: HTMLElement) => void) {
  const selector = ".atlaskit-portal-container";

  const observer = new MutationObserver(() => {
    console.log("[plasmo] MutationObserver triggered");
    const modal = findModal();
    if (modal && !modal.dataset.opened) {
      handleModalInitialization(modal);
      console.log("[plasmo] bitbucket pull request modal opened");
      modal.dataset.opened = "true";
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
