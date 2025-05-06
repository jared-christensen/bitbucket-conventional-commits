export function findModal(): HTMLElement | null {
  const selector = 'section[role="dialog"]';
  const modal = document.querySelector(selector);
  return modal instanceof HTMLElement ? modal : null;
}
