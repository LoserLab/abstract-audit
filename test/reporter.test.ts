import { describe, it, expect } from "vitest";
import { join } from "path";
import { scan } from "../src/scanner";
import { formatHuman, formatJson } from "../src/reporter";

const FIXTURES = join(__dirname, "fixtures");

describe("reporter", () => {
  describe("formatHuman", () => {
    it("should include tool name and version", () => {
      const result = scan(join(FIXTURES, "clean"));
      const output = formatHuman(result, false);
      expect(output).toContain("abstract-audit");
      expect(output).toContain("v0.1.0");
    });

    it("should show file counts", () => {
      const result = scan(join(FIXTURES, "clean"));
      const output = formatHuman(result, false);
      expect(output).toContain(".sol");
      expect(output).toContain("config");
    });

    it("should show clean message when no issues", () => {
      const result = scan(join(FIXTURES, "clean"));
      // Filter out info issues for a clean check
      result.issues = result.issues.filter((i) => i.severity !== "info");
      result.summary.info = 0;
      const output = formatHuman(result, false);
      expect(output).toContain("No issues found");
    });

    it("should show severity labels for issues", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const output = formatHuman(result, false);
      expect(output).toContain("CRITICAL");
      expect(output).toContain("HIGH");
    });

    it("should show fix suggestions", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const output = formatHuman(result, false);
      expect(output).toContain("Fix:");
    });

    it("should show issue count summary", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const output = formatHuman(result, false);
      expect(output).toContain("issues found");
    });
  });

  describe("formatJson", () => {
    it("should produce valid JSON", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const json = formatJson(result);
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
    });

    it("should include version", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const parsed = JSON.parse(formatJson(result));
      expect(parsed.version).toBe("0.1.0");
    });

    it("should include issues array", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const parsed = JSON.parse(formatJson(result));
      expect(Array.isArray(parsed.issues)).toBe(true);
      expect(parsed.issues.length).toBeGreaterThan(0);
    });

    it("should include summary", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const parsed = JSON.parse(formatJson(result));
      expect(parsed.summary).toBeDefined();
      expect(typeof parsed.summary.critical).toBe("number");
    });

    it("should set exit_code 2 for critical issues", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const parsed = JSON.parse(formatJson(result));
      expect(parsed.exit_code).toBe(2);
    });

    it("should set exit_code 0 for clean project", () => {
      const result = scan(join(FIXTURES, "clean"));
      // Remove info issues
      result.issues = result.issues.filter((i) => i.severity !== "info");
      result.summary = { critical: 0, high: 0, moderate: 0, info: 0 };
      result.exitCode = 0;
      const parsed = JSON.parse(formatJson(result));
      expect(parsed.exit_code).toBe(0);
    });
  });
});