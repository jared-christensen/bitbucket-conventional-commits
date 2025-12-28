import { describe, expect, it } from "vitest";

import { buildPrompt } from "./prompt";

describe("buildPrompt", () => {
  it("includes PR title", () => {
    const result = buildPrompt("", "Add login feature", "");
    expect(result).toContain("PR Title: Add login feature");
  });

  it("includes user notes when provided", () => {
    const result = buildPrompt("fixed the auth bug", "Fix auth", "");
    expect(result).toContain("User's notes");
    expect(result).toContain("fixed the auth bug");
  });

  it("excludes user notes section when empty", () => {
    const result = buildPrompt("", "Fix auth", "");
    expect(result).not.toContain("User's notes");
  });

  it("includes PR description when provided", () => {
    const result = buildPrompt("", "Fix auth", "This fixes the login issue");
    expect(result).toContain("PR Description:");
    expect(result).toContain("This fixes the login issue");
  });

  it("excludes PR description section when empty", () => {
    const result = buildPrompt("", "Fix auth", "");
    expect(result).not.toContain("PR Description:");
  });

  it("trims whitespace from inputs", () => {
    const result = buildPrompt("  notes  ", "  title  ", "  description  ");
    expect(result).toContain("notes");
    expect(result).toContain("PR Title: title");
    expect(result).toContain("description");
  });

  it("includes conventional commit format instructions", () => {
    const result = buildPrompt("", "Test", "");
    expect(result).toContain("type(scope): description");
  });

  it("includes all commit types", () => {
    const result = buildPrompt("", "Test", "");
    expect(result).toContain("feat:");
    expect(result).toContain("fix:");
    expect(result).toContain("refactor:");
    expect(result).toContain("chore:");
  });

  it("includes key rules", () => {
    const result = buildPrompt("", "Test", "");
    expect(result).toContain("imperative mood");
    expect(result).toContain("No period at the end");
    expect(result).toContain("72 characters");
  });

  it("handles all empty inputs", () => {
    const result = buildPrompt("", "", "");
    expect(result).toContain("PR Title:");
    expect(result).not.toContain("User's notes");
    expect(result).not.toContain("PR Description:");
  });
});
