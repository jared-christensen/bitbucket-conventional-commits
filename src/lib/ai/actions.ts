// High-level action for generating and setting commit message

import { findTextArea, setTextAreaValue } from "~utils/dom";
import { findJiraId, getBranchName, getJiraFromSidebar, getPrDescription, getPrTitle } from "~utils/pr-context";

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
  const branchName = getBranchName();
  const prDescription = getPrDescription();

  // Get Jira info: prefer sidebar (cached), fall back to branch name
  const sidebarJira = getJiraFromSidebar();
  const jiraId = sidebarJira?.id || findJiraId(branchName);
  const jiraTitle = sidebarJira?.title || "";

  console.log("[BCC] Generate context:", {
    prTitle: prTitle || "(not found)",
    branchName: branchName || "(not found)",
    jiraId: jiraId || "(not found)",
    jiraTitle: jiraTitle || "(not found)",
    jiraSource: sidebarJira ? "sidebar (cached)" : jiraId ? "branch" : "none",
    prDescription: prDescription ? prDescription.slice(0, 100) + (prDescription.length > 100 ? "..." : "") : "(not found)",
    userInput: textarea.value || "(empty)",
  });

  try {
    const newMessage = await generateCommitMessage({
      textareaValue: textarea.value,
      prTitle,
      jiraId,
      jiraTitle,
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
