export function getPrDescription(): string {
  const selector = "#pull-request-description-panel";
  const prDescriptionElement = document.querySelector(selector);
  return prDescriptionElement?.textContent?.trim() || "";
}
