import { Command } from "commander";
import { resolve } from "path";
import { scan } from "./scanner";
import { formatHuman, formatJson } from "./reporter";
import type { Severity } from "./rules/types";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "moderate", "info"];

export async function cli(argv: string[]): Promise<void> {
  const program = new Command();

  program
    .name("abstract-audit")
    .description(
      "Solidity contract and project scanner for Abstract (ZKsync L2). Catches EVM incompatibilities before deployment.",
    )
    .version("0.1.0")
    .argument("[path]", "Path to project directory", ".")
    .option("--json", "Output as JSON")
    .option(
      "--severity <level>",
      "Minimum severity to report (critical, high, moderate, info)",
      "info",
    )
    .action((targetPath, opts) => {
      const resolvedPath = resolve(targetPath);

      try {
        const result = scan(resolvedPath);

        // Filter by severity
        const minSeverity = opts.severity as Severity;
        const minIndex = SEVERITY_ORDER.indexOf(minSeverity);
        if (minIndex > 0) {
          result.issues = result.issues.filter(
            (i) => SEVERITY_ORDER.indexOf(i.severity) <= minIndex,
          );
          // Recount
          result.summary = { critical: 0, high: 0, moderate: 0, info: 0 };
          for (const issue of result.issues) {
            result.summary[issue.severity]++;
          }
        }

        // Output
        if (opts.json) {
          console.log(formatJson(result));
        } else {
          console.log(formatHuman(result));
        }

        // Exit code
        if (result.summary.critical > 0) {
          process.exit(2);
        } else if (result.summary.high > 0 || result.summary.moderate > 0) {
          process.exit(1);
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.parse(argv);
}