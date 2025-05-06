import { findModal } from "./find-modal";

export function documentObserver(handleModalInitialization: (modal: HTMLElement) => void) {
  const selector = ".atlaskit-portal-container";

  const observer = new MutationObserver(() => {
    const modal = findModal();
    if (modal) {
      if (modal.dataset.opened) {
        return;
      }
      handleModalInitialization(modal);
      modal.dataset.opened = "true";
    }
  });

  observer.observe(document.querySelector(selector), { childList: true });
}
