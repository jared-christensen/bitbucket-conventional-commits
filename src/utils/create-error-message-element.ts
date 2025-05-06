export function createErrorMessageElement(element: HTMLElement) {
  const selector = "lint-error-message";
  let errorMessageElement = document.getElementById(selector);
  if (!errorMessageElement) {
    errorMessageElement = document.createElement("div");
    errorMessageElement.id = selector;
    errorMessageElement.className = "bcc-lint-error-message";
    errorMessageElement.style.display = "none";
    element.insertAdjacentElement("afterend", errorMessageElement);
  }
  return errorMessageElement;
}
