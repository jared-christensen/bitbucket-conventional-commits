// High-level action for generating and setting commit message

import { findTextArea, setTextAreaValue } from "~utils/dom";
import { findJiraId, getPrDescription, getPrTitle } from "~utils/pr-context";

import { generateCommitMessage } from "./generate";

export async function generateAndSetCommitMessage() {
  const textarea = findTextArea();
  const button = document.querySelector(".bcc-generate-commit-message") as HTMLButtonElement;

  if (!textarea || !button) {
    return;
  }

  const originalButtonHTML = button.innerHTML;
  button.innerHTML = "Generating...";
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
    button.innerHTML = originalButtonHTML;
    button.disabled = false;
  }
}
