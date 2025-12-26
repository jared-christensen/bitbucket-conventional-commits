// DOM selectors and element creation for Bitbucket merge modal

export function findModal(): HTMLElement | null {
  const modal = document.querySelector('section[role="dialog"]');
  return modal instanceof HTMLElement ? modal : null;
}

export function findTextArea(): HTMLTextAreaElement | null {
  const modal = findModal();
  if (!modal) return null;
  const textarea = modal.querySelector('textarea[name="merge-dialog-commit-message-textfield"]');
  return textarea instanceof HTMLTextAreaElement ? textarea : null;
}

export function setTextAreaValue(value: string) {
  const textarea = findTextArea();
  if (textarea) {
    textarea.value = value;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

export function createGenerateButton(element: HTMLElement, onClick: () => void) {
  const button = document.createElement("button");
  button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 6px;"><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/></svg>Generate`;
  button.className = "bcc-generate-commit-message";
  button.addEventListener("click", onClick);
  element.insertAdjacentElement("afterend", button);
}

export function createErrorMessageElement(textarea: HTMLTextAreaElement): HTMLElement {
  const errorElement = document.createElement("div");
  errorElement.className = "bcc-lint-error-message";
  errorElement.style.display = "none";
  textarea.insertAdjacentElement("afterend", errorElement);
  return errorElement;
}
