export type Severity = "critical" | "high" | "moderate" | "info";

export type RuleTarget = "solidity" | "config";

export interface Rule {
  /** Unique rule identifier */
  id: string;
  /** What this rule scans: solidity source files or project config */
  target: RuleTarget;
  /** Severity level */
  severity: Severity;
  /** Regex pattern to match in file content */
  pattern: RegExp;
  /** Short title for the issue */
  title: string;
  /** Detailed explanation */
  detail: string;
  /** Suggested fix */
  fix: string;
  /** URL for more information */
  url?: string;
}

export interface Issue {
  severity: Severity;
  ruleId: string;
  file: string;
  line: number;
  match: string;
  title: string;
  detail: string;
  fix: string;
  url?: string;
}

export interface ScanResult {
  version: string;
  issues: Issue[];
  summary: Record<Severity, number>;
  totalFiles: number;
  solidityFiles: number;
  configFiles: number;
  exitCode: number;
}