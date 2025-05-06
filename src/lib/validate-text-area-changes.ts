import { lintCommitMessage } from "./lint-commit-message";
import { setValidationMessage } from "./set-validation-message";

export function validateTextAreaChanges(textarea: HTMLTextAreaElement) {
  textarea.addEventListener("input", () => {
    const commitMessage = textarea.value;
    const { isValid, errors } = lintCommitMessage(commitMessage);

    setValidationMessage(textarea, isValid, errors);
  });
}
