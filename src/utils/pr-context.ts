// Utilities for extracting context from Bitbucket PR pages

// Cache for PR context (only available on Overview tab)
// Keyed by PR URL to avoid mixing data across PRs
let cache: {
  prUrl: string | null;
  description: string | null;
  jira: { id: string; title: string } | null;
} = {
  prUrl: null,
  description: null,
  jira: null,
};

/**
 * Gets the current PR URL (without hash/query) to use as cache key.
 * Returns null if not on a PR page.
 */
function getPrUrl(): string | null {
  const match = window.location.pathname.match(/^\/[^/]+\/[^/]+\/pull-requests\/\d+/);
  return match ? match[0] : null;
}

/**
 * Clears cache if we're on a different PR.
 */
function validateCache(): void {
  const currentPrUrl = getPrUrl();
  if (currentPrUrl !== cache.prUrl) {
    cache = { prUrl: currentPrUrl, description: null, jira: null };
  }
}

/**
 * Gets PR title from the modal dialog or PR header.
 * Modal title is in the h1, PR header also has an h1 with the title.
 */
export function getPrTitle(): string {
  // Try PR header first (more reliable, always present on PR pages)
  const prHeader = document.querySelector('[data-testid="pr-header"] h1');
  if (prHeader?.textContent?.trim()) {
    return prHeader.textContent.trim();
  }
  return "";
}

/**
 * Gets source branch name from the merge modal.
 * Modal has "Source" label followed by branch name.
 */
export function getBranchName(): string {
  const modal = document.querySelector('[data-testid="modal-dialog"]');
  if (!modal) return "";

  const modalBody = modal.querySelector('[data-testid="modal-dialog--body"]');
  if (!modalBody) return "";

  const spans = modalBody.querySelectorAll("span");
  let foundSource = false;
  for (const span of spans) {
    const text = span.textContent?.trim() || "";
    if (text === "Source") {
      foundSource = true;
      continue;
    }
    // The next non-empty span after "Source" is the branch name
    if (foundSource && text && text !== "Destination") {
      return text;
    }
  }
  return "";
}

/**
 * Gets and caches PR description.
 * Description is only available on the Overview tab, so we cache it.
 */
export function getPrDescription(): string {
  validateCache();

  // Try to get fresh description
  const prDescriptionElement = document.querySelector("#pull-request-description-panel");
  const freshDescription = prDescriptionElement?.textContent?.trim() || "";

  // Update cache if we found a description
  if (freshDescription) {
    cache.description = freshDescription;
  }

  return cache.description || "";
}


/**
 * Extracts a JIRA ID from a given string.
 * A JIRA ID follows the pattern "ABC-123" (uppercase project key + number).
 */
export function findJiraId(input: string): string | null {
  const match = input.match(/[A-Z]+-\d+/);
  return match ? match[0] : null;
}

/**
 * Gets and caches Jira info from the sidebar work items panel.
 * Only available on Overview tab, so we cache it.
 */
export function getJiraFromSidebar(): { id: string; title: string } | null {
  validateCache();

  // Try to get fresh Jira info
  const jiraLink = document.querySelector('[data-testid="jira-issues-card-item"]');
  if (jiraLink) {
    const href = jiraLink.getAttribute("href") || "";
    const id = findJiraId(href);
    if (id) {
      const fullText = jiraLink.textContent?.trim() || "";
      const title = fullText.replace(id, "").trim();
      cache.jira = { id, title };
    }
  }

  return cache.jira;
}

/**
 * Call this early to cache context (description + Jira) before user navigates to other tabs.
 */
export function cacheContext(): void {
  getPrDescription();
  getJiraFromSidebar();
}

