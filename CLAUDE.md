# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Plasmo browser extension that adds conventional commit linting and AI-powered commit message generation to the Bitbucket merge modal. It validates commit messages against conventional commit standards and generates suggestions using OpenAI's GPT-3.5-turbo API.

## Commands

```bash
pnpm dev              # Start development server with hot reload
pnpm build            # Production build
pnpm build-chrome     # Build and zip for Chrome
pnpm build-firefox    # Build and zip for Firefox
pnpm build-edge       # Build and zip for Edge
pnpm build-all        # Build all browser targets
```

## Architecture

### Extension Entry Points

- **`src/content.ts`** - Content script injected on Bitbucket PR pages (`https://bitbucket.org/*/pull-requests/*`). Sets up the document observer and initializes modal enhancements.
- **`src/options.tsx`** - Extension options page for configuring the OpenAI API key. Uses React with shadcn/ui components.
- **`src/popup.tsx`** - Browser action popup (minimal).

### Core Flow

1. `documentObserver` watches for Bitbucket's Atlaskit modal container (`.atlaskit-portal-container`)
2. When merge modal opens, it finds the commit message textarea and injects:
   - A "Generate" button that triggers AI commit message generation
   - Real-time validation with error messages
   - Conditional merge button visibility based on validation state

### Key Modules

- **`src/lib/generate-commit-message.ts`** - Calls OpenAI API to generate commit messages from PR context
- **`src/lib/build-prompt.ts`** - Constructs the prompt for OpenAI with conventional commit guidelines
- **`src/lib/lint-commit-message.ts`** - Validates messages against conventional commit format using `@commitlint/config-conventional` types
- **`src/lib/validate-text-area-changes.ts`** - Attaches input listener for real-time validation
- **`src/lib/hide-merge-button-if-invalid.ts`** - Controls merge button visibility based on validation

### Utilities (`src/utils/`)

DOM manipulation helpers for Bitbucket's UI:
- `find-modal.ts`, `find-text-area.ts`, `find-merge-button.ts` - Element selectors
- `document-observer.ts`, `modal-observer.ts` - MutationObserver wrappers
- `find-jira-id.ts` - Extracts Jira IDs from PR titles (appended to commit footer)

### Storage

Uses `@plasmohq/storage` to persist the OpenAI API key in browser extension storage. Key: `"options"` containing `{ apiKey: string }`.

## Conventional Commit Rules

The linter enforces:
- Format: `type(scope): description`
- Valid types: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
- Scope must be kebab-case and lowercase
- Description starts lowercase, no ending punctuation
- Jira IDs must be in footer, not subject line
