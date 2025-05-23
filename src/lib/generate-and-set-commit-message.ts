import { findTextArea } from "~utils/find-text-area";

import { findJiraId } from "../utils/find-jira-id";
import { getPrDescription } from "../utils/get-pr-description";
import { getPrTitle } from "../utils/get-pr-title";
import { setTextAreaValue } from "../utils/set-textarea-value";
import { generateCommitMessage } from "./generate-commit-message";

export async function generateAndSetCommitMessage() {
  const textarea = findTextArea();
  const button = document.querySelector(".bcc-generate-commit-message") as HTMLButtonElement;

  if (!textarea || !button) {
    return;
  }

  const originalButtonText = button.textContent;
  button.textContent = "Generating...";
  button.disabled = true;

  const prTitle = getPrTitle();
  const jiraId = findJiraId(prTitle);
  const prDescription = getPrDescription();

  try {
    const newMessage = await generateCommitMessage({
      textareaValue: textarea.value,
      prTitle,
      jiraId,
      prDescription,
    });
    if (newMessage) {
      setTextAreaValue(newMessage);
    }
  } catch (error) {
    setTextAreaValue(`${error}`);
  } finally {
    button.textContent = originalButtonText;
    button.disabled = false;
  }
}
