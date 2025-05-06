export function createGenerateButton(element: HTMLElement, onClick: () => void) {
  const button = document.createElement("button");
  button.textContent = "Generate Commit Message";
  button.className = "bcc-generate-commit-message";
  button.addEventListener("click", onClick);
  element.insertAdjacentElement("afterend", button);
}
