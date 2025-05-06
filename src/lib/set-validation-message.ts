export function setValidationMessage(textarea: HTMLTextAreaElement, isValid: boolean, errors: string[]): void {
  const selector = "lint-error-message";
  const errorMessageElement = document.getElementById(selector);

  if (!isValid) {
    textarea.style.borderColor = "var(--ds-border-warning)";
    if (errorMessageElement) {
      errorMessageElement.textContent = errors.join(" ");
      errorMessageElement.style.display = "block";
    }
  } else {
    textarea.style.borderColor = "";
    if (errorMessageElement) {
      errorMessageElement.style.display = "none";
    }
  }
}
