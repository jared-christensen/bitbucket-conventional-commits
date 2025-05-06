export function getPrTitle(): string {
  const selector = '[data-testid="pr-header"] h1';
  const prHeader = document.querySelector(selector);
  return prHeader?.textContent?.trim() || "";
}
