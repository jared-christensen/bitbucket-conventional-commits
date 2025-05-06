export function modalObserver(modal: HTMLElement, handleModalChanges: (modal: HTMLElement) => void) {
  if (modal.dataset.mergeObserverAttached) {
    return;
  }

  const observer = new MutationObserver(() => {
    handleModalChanges(modal);
  });

  const config = { childList: true, subtree: true };
  observer.observe(modal, config);

  modal.dataset.mergeObserverAttached = "true";
}
