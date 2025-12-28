import { describe, expect, it } from "vitest";

import { lintCommitMessage } from "./lint";

describe("lintCommitMessage", () => {
  describe("valid messages", () => {
    it("accepts basic type: description format", () => {
      const result = lintCommitMessage("feat: add new feature");
      expect(result.isValid).toBe(true);
      expect(result.severity).toBe("none");
    });

    it("accepts type(scope): description format", () => {
      const result = lintCommitMessage("fix(auth): resolve login issue");
      expect(result.isValid).toBe(true);
    });

    it("accepts breaking change with !", () => {
      const result = lintCommitMessage("feat!: breaking api change");
      expect(result.isValid).toBe(true);
    });

    it("accepts breaking change with scope and !", () => {
      const result = lintCommitMessage("feat(api)!: breaking endpoint change");
      expect(result.isValid).toBe(true);
    });

    it("accepts all standard types", () => {
      const types = ["feat", "fix", "chore", "docs", "style", "refactor", "perf", "test", "build", "ci", "revert"];
      types.forEach((type) => {
        const result = lintCommitMessage(`${type}: some description`);
        expect(result.isValid).toBe(true);
      });
    });

    it("accepts kebab-case scopes", () => {
      const result = lintCommitMessage("feat(user-auth): add oauth support");
      expect(result.isValid).toBe(true);
    });

    it("accepts scopes with numbers", () => {
      const result = lintCommitMessage("fix(api-v2): correct response format");
      expect(result.isValid).toBe(true);
    });
  });

  describe("errors (block merge)", () => {
    it("rejects empty message", () => {
      const result = lintCommitMessage("");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("Add a commit message");
    });

    it("rejects whitespace-only message", () => {
      const result = lintCommitMessage("   ");
      expect(result.severity).toBe("error");
    });

    it("rejects ticket prefix at start", () => {
      const result = lintCommitMessage("ECHO-1234: feat: add feature");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("ticket");
    });

    it("rejects missing colon after scope", () => {
      const result = lintCommitMessage("feat(scope) description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("colon");
    });

    it("rejects missing colon after scope with breaking change", () => {
      const result = lintCommitMessage("feat(scope)! description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("colon");
    });

    it("rejects space before scope", () => {
      const result = lintCommitMessage("feat (scope): description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("space");
    });

    it("rejects uppercase type", () => {
      const result = lintCommitMessage("FEAT: description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("lowercase");
    });

    it("rejects title-case type", () => {
      const result = lintCommitMessage("Feat: description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("lowercase");
    });

    it("rejects uppercase breaking change type", () => {
      const result = lintCommitMessage("FEAT!: description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("lowercase");
    });

    it("rejects non-kebab-case scope", () => {
      const result = lintCommitMessage("feat(userAuth): description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("kebab-case");
    });

    it("rejects scope with uppercase", () => {
      const result = lintCommitMessage("feat(UserAuth): description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("kebab-case");
    });

    it("rejects scope with underscores", () => {
      const result = lintCommitMessage("feat(user_auth): description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("kebab-case");
    });

    it("rejects invalid format", () => {
      const result = lintCommitMessage("this is not a conventional commit");
      expect(result.severity).toBe("error");
    });

    it("rejects invalid type", () => {
      const result = lintCommitMessage("foo: some description");
      expect(result.severity).toBe("error");
      expect(result.errors[0]).toContain("standard type");
    });

    it("rejects missing description", () => {
      const result = lintCommitMessage("feat:");
      expect(result.severity).toBe("error");
    });

    it("rejects missing space after colon", () => {
      const result = lintCommitMessage("feat:description");
      expect(result.severity).toBe("error");
    });
  });

  describe("warnings (allow merge)", () => {
    it("warns on uppercase description", () => {
      const result = lintCommitMessage("feat: Add new feature");
      expect(result.severity).toBe("warning");
      expect(result.errors[0]).toContain("Lowercase");
    });

    it("warns on ending period", () => {
      const result = lintCommitMessage("feat: add new feature.");
      expect(result.severity).toBe("warning");
      expect(result.errors[0]).toContain("punctuation");
    });

    it("warns on ending exclamation", () => {
      const result = lintCommitMessage("feat: add new feature!");
      expect(result.severity).toBe("warning");
      expect(result.errors[0]).toContain("punctuation");
    });

    it("warns on ending question mark", () => {
      const result = lintCommitMessage("feat: add new feature?");
      expect(result.severity).toBe("warning");
      expect(result.errors[0]).toContain("punctuation");
    });

    it("warns on subject line over 72 characters", () => {
      const longMessage = "feat: " + "a".repeat(70);
      const result = lintCommitMessage(longMessage);
      expect(result.severity).toBe("warning");
      expect(result.errors[0]).toContain("72");
    });

    it("warns on subject line over 50 characters", () => {
      const mediumMessage = "feat: " + "a".repeat(50);
      const result = lintCommitMessage(mediumMessage);
      expect(result.severity).toBe("warning");
      expect(result.errors[0]).toContain("50");
    });

    it("does not warn on subject line under 50 characters", () => {
      const shortMessage = "feat: add feature";
      const result = lintCommitMessage(shortMessage);
      expect(result.isValid).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles colons in description", () => {
      const result = lintCommitMessage("feat: add time format: HH:MM:SS");
      expect(result.isValid).toBe(true);
    });

    it("handles multiline messages", () => {
      const result = lintCommitMessage("feat: add feature\n\nThis is the body");
      expect(result.isValid).toBe(true);
    });

    it("trims whitespace", () => {
      const result = lintCommitMessage("  feat: add feature  ");
      expect(result.isValid).toBe(true);
    });
  });
});
