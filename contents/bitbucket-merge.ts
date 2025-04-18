import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*/pull-requests/*"],
  run_at: "document_idle"
}

export {}

function clearCommitMessage(textarea: HTMLTextAreaElement) {
  textarea.value = ""
  // Dispatching the input event ensures that any event listeners or bindings (e.g., React's onChange) are triggered,
  // keeping the application state in sync with the DOM.
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
  console.log("[plasmo] Cleared commit message.")
}

const TEXTAREA_SELECTOR =
  'textarea[name="merge-dialog-commit-message-textfield"]'
const MODAL_SELECTOR = 'section[role="dialog"]'

const observer = new MutationObserver(() => {
  const modal = document
    .querySelector(TEXTAREA_SELECTOR)
    ?.closest(MODAL_SELECTOR)

  if (!modal) return

  const textarea = modal.querySelector(
    TEXTAREA_SELECTOR
  ) as HTMLTextAreaElement | null

  if (textarea) {
    clearCommitMessage(textarea)
  }
})

observer.observe(document.body, { childList: true, subtree: true })
