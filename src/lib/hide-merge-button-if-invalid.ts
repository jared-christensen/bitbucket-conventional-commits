import { findMergeButton } from "../utils/find-merge-button";
import { modalObserver } from "../utils/modal-observer";
import { lintCommitMessage } from "./lint-commit-message";

export function hideMergeButtonIfInvalid(modal: HTMLElement, textarea: HTMLTextAreaElement) {
  modalObserver(modal, () => {
    const mergeButton = findMergeButton(modal);

    if (mergeButton && textarea) {
      const { isValid } = lintCommitMessage(textarea.value);
      mergeButton.style.display = isValid ? "" : "none";
    }
  });
}
