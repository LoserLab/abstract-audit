import { describe, it, expect } from "vitest";
import { join } from "path";
import { scan } from "../src/scanner";

const FIXTURES = join(__dirname, "fixtures");

describe("scanner", () => {
  describe("clean project", () => {
    it("should find no critical, high, or moderate issues", () => {
      const result = scan(join(FIXTURES, "clean"));
      const serious = result.issues.filter(
        (i) => i.severity !== "info",
      );
      expect(serious).toHaveLength(0);
    });

    it("should scan .sol files", () => {
      const result = scan(join(FIXTURES, "clean"));
      expect(result.solidityFiles).toBeGreaterThan(0);
    });

    it("should scan config files", () => {
      const result = scan(join(FIXTURES, "clean"));
      expect(result.configFiles).toBeGreaterThan(0);
    });

    it("should return correct version", () => {
      const result = scan(join(FIXTURES, "clean"));
      expect(result.version).toBe("0.1.0");
    });
  });

  describe("vulnerable project", () => {
    it("should find critical issues for selfdestruct", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const selfdestructIssues = result.issues.filter(
        (i) => i.ruleId === "SOL001",
      );
      expect(selfdestructIssues.length).toBeGreaterThan(0);
      expect(selfdestructIssues[0].severity).toBe("critical");
    });

    it("should find critical issues for callcode", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const callcodeIssues = result.issues.filter(
        (i) => i.ruleId === "SOL002",
      );
      expect(callcodeIssues.length).toBeGreaterThan(0);
      expect(callcodeIssues[0].severity).toBe("critical");
    });

    it("should find critical issues for extcodecopy", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL003",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("critical");
    });

    it("should find high issues for .transfer()", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL005",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for .send()", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL006",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for ecrecover", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL007",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for block.coinbase", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL008",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for block.difficulty", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL009",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for prevrandao", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL010",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find moderate issues for gasleft()", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL011",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("moderate");
    });

    it("should find moderate issues for extcodesize", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL012",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("moderate");
    });

    it("should find moderate issues for tx.origin == msg.sender", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL014",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("moderate");
    });

    it("should find moderate issues for CREATE2", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "SOL015",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("moderate");
    });

    it("should include file and line information", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      for (const issue of result.issues) {
        expect(issue.file).toBeTruthy();
        expect(issue.line).toBeGreaterThanOrEqual(0);
      }
    });

    it("should sort issues by severity", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const severityOrder = { critical: 0, high: 1, moderate: 2, info: 3 };
      for (let i = 1; i < result.issues.length; i++) {
        expect(
          severityOrder[result.issues[i].severity],
        ).toBeGreaterThanOrEqual(
          severityOrder[result.issues[i - 1].severity],
        );
      }
    });

    it("should have correct summary counts", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      let critical = 0, high = 0, moderate = 0, info = 0;
      for (const issue of result.issues) {
        if (issue.severity === "critical") critical++;
        if (issue.severity === "high") high++;
        if (issue.severity === "moderate") moderate++;
        if (issue.severity === "info") info++;
      }
      expect(result.summary.critical).toBe(critical);
      expect(result.summary.high).toBe(high);
      expect(result.summary.moderate).toBe(moderate);
      expect(result.summary.info).toBe(info);
    });

    it("should detect missing zksync plugin for hardhat project", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "CFG002",
      );
      expect(issues.length).toBeGreaterThan(0);
    });
  });

  describe("config issues project", () => {
    it("should find deprecated individual zksync packages", () => {
      const result = scan(join(FIXTURES, "config-issues"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "CFG004",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("moderate");
    });
  });

  describe("error handling", () => {
    it("should throw for non-existent directory", () => {
      expect(() => scan("/nonexistent/path")).toThrow("Directory not found");
    });
  });
});