export function findMergeButton(element: HTMLElement): HTMLButtonElement | null {
  const modalButtons: HTMLButtonElement[] = Array.from(element.querySelectorAll("button"));
  const mergeButton = modalButtons.find((button) => button.textContent.trim() === "Merge");
  return mergeButton as HTMLButtonElement | null;
}
