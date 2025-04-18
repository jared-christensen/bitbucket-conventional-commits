import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://bitbucket.org/*/pull-requests/*"],
  run_at: "document_idle"
}

export {}

function waitForElement(
  selector: string,
  timeout = 5000
): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const intervalTime = 100
    let timePassed = 0

    const interval = setInterval(() => {
      const el = document.querySelector<HTMLElement>(selector)
      if (el) {
        clearInterval(interval)
        resolve(el)
      }
      timePassed += intervalTime
      if (timePassed >= timeout) {
        clearInterval(interval)
        reject(new Error("Element not found"))
      }
    }, intervalTime)
  })
}

async function clearCommitMessage() {
  try {
    const textarea = (await waitForElement(
      'textarea[name="merge-dialog-commit-message-textfield"]'
    )) as HTMLTextAreaElement
    textarea.value = ""
    textarea.dispatchEvent(new Event("input", { bubbles: true }))
    console.log("[plasmo] Cleared commit message.")
  } catch (err) {
    console.warn("[plasmo] Could not find commit message box:", err)
  }
}

const observer = new MutationObserver(() => {
  const modal = document.querySelector(
    'textarea[name="merge-dialog-commit-message-textfield"]'
  )
  if (modal) {
    clearCommitMessage()
    observer.disconnect()
  }
})

observer.observe(document.body, { childList: true, subtree: true })
