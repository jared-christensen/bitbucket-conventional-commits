import { findModal } from "../utils/find-modal";

export function findTextArea(): HTMLTextAreaElement | null {
  const selector = 'textarea[name="merge-dialog-commit-message-textfield"]';
  const modal = findModal();
  if (!modal) {
    return null;
  }
  const textarea = modal.querySelector(selector);
  return textarea instanceof HTMLTextAreaElement ? textarea : null;
}
