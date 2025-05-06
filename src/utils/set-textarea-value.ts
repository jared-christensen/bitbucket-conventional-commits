import { findTextArea } from "~utils/find-text-area";

export function setTextAreaValue(value: string) {
  const textarea = findTextArea();
  if (textarea) {
    textarea.value = value;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
