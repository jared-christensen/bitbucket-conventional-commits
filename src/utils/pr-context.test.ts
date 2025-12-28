import { describe, expect, it } from "vitest";

import { findJiraId } from "./pr-context";

describe("findJiraId", () => {
  it("extracts Jira ID from start of string", () => {
    expect(findJiraId("ECHO-1234 fix login bug")).toBe("ECHO-1234");
  });

  it("extracts Jira ID from middle of string", () => {
    expect(findJiraId("fix login bug ECHO-1234 test")).toBe("ECHO-1234");
  });

  it("extracts Jira ID from end of string", () => {
    expect(findJiraId("fix login bug ECHO-1234")).toBe("ECHO-1234");
  });

  it("extracts first Jira ID when multiple present", () => {
    expect(findJiraId("ECHO-1234 and PROJ-5678")).toBe("ECHO-1234");
  });

  it("handles various project key lengths", () => {
    expect(findJiraId("A-1")).toBe("A-1");
    expect(findJiraId("AB-12")).toBe("AB-12");
    expect(findJiraId("ABCDEF-123456")).toBe("ABCDEF-123456");
  });

  it("returns null when no Jira ID found", () => {
    expect(findJiraId("fix login bug")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(findJiraId("")).toBeNull();
  });

  it("ignores lowercase project keys", () => {
    expect(findJiraId("echo-1234")).toBeNull();
  });

  it("ignores mixed case project keys", () => {
    expect(findJiraId("Echo-1234")).toBeNull();
  });

  it("handles Jira ID in brackets", () => {
    expect(findJiraId("[ECHO-1234] fix bug")).toBe("ECHO-1234");
  });

  it("handles Jira ID in parentheses", () => {
    expect(findJiraId("fix bug (ECHO-1234)")).toBe("ECHO-1234");
  });
});
