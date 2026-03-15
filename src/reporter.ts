import type { ScanResult, Severity } from "./rules/types";

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "\x1b[31m", // red
  high: "\x1b[33m",     // yellow
  moderate: "\x1b[36m", // cyan
  info: "\x1b[90m",     // gray
};
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

export function formatHuman(result: ScanResult, useColor = true): string {
  const c = (color: string, text: string) =>
    useColor ? `${color}${text}${RESET}` : text;

  const lines: string[] = [];

  lines.push(`${c(BOLD, "abstract-audit")} v${result.version}`);
  lines.push("");
  lines.push(
    `Scanning project... Found ${result.totalFiles} files (${result.solidityFiles} .sol, ${result.configFiles} config)`,
  );
  lines.push("");

  if (result.issues.length === 0) {
    lines.push(c("\x1b[32m", "  No issues found. Your contracts look clean for Abstract deployment."));
    lines.push("");
    return lines.join("\n");
  }

  for (const issue of result.issues) {
    const color = SEVERITY_COLORS[issue.severity];
    const label = issue.severity.toUpperCase().padEnd(8);
    const location = issue.line > 0 ? `${issue.file}:${issue.line}` : issue.file;

    lines.push(
      `  ${c(color, c(BOLD, label))}  ${c(BOLD, location)}`,
    );
    lines.push(`            ${issue.title}`);
    lines.push(`            ${c(DIM, "Fix:")} ${issue.fix}`);
    lines.push("");
  }

  const parts: string[] = [];
  if (result.summary.critical > 0)
    parts.push(c(SEVERITY_COLORS.critical, `${result.summary.critical} critical`));
  if (result.summary.high > 0)
    parts.push(c(SEVERITY_COLORS.high, `${result.summary.high} high`));
  if (result.summary.moderate > 0)
    parts.push(c(SEVERITY_COLORS.moderate, `${result.summary.moderate} moderate`));
  if (result.summary.info > 0)
    parts.push(c(SEVERITY_COLORS.info, `${result.summary.info} info`));

  lines.push(`${result.issues.length} issues found (${parts.join(", ")})`);
  lines.push("");

  return lines.join("\n");
}

export function formatJson(result: ScanResult): string {
  return JSON.stringify(
    {
      version: result.version,
      issues: result.issues,
      summary: result.summary,
      exit_code: result.exitCode,
    },
    null,
    2,
  );
}