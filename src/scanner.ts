import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { solidityRules } from "./rules/solidity";
import { configRules, CFG002 } from "./rules/config";
import type { Issue, Rule, ScanResult, Severity } from "./rules/types";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  info: 3,
};

const CONFIG_FILES = [
  "hardhat.config.ts",
  "hardhat.config.js",
  "foundry.toml",
  "package.json",
];

/**
 * Recursively collect all files matching a predicate.
 */
function collectFiles(
  dir: string,
  predicate: (name: string) => boolean,
  results: string[] = [],
): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    // Skip common non-source directories
    if (
      entry === "node_modules" ||
      entry === "dist" ||
      entry === "build" ||
      entry === "out" ||
      entry === "artifacts" ||
      entry === "cache" ||
      entry === ".git"
    ) {
      continue;
    }

    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      collectFiles(full, predicate, results);
    } else if (predicate(entry)) {
      results.push(full);
    }
  }

  return results;
}

/**
 * Scan a line of content against rules, returning any issues found.
 */
function scanLine(
  content: string,
  lineNum: number,
  filePath: string,
  rules: Rule[],
): Issue[] {
  const issues: Issue[] = [];

  for (const rule of rules) {
    if (rule.pattern.test(content)) {
      const match = content.match(rule.pattern);
      issues.push({
        severity: rule.severity,
        ruleId: rule.id,
        file: filePath,
        line: lineNum,
        match: match ? match[0] : "",
        title: rule.title,
        detail: rule.detail,
        fix: rule.fix,
        url: rule.url,
      });
    }
  }

  return issues;
}

/**
 * Deduplicate issues: if a line triggers both a high-severity rule and an
 * info-severity rule for the same pattern (e.g., SOL005/SOL006 and SOL016),
 * keep only the higher severity one.
 */
function deduplicateIssues(issues: Issue[]): Issue[] {
  const groups = new Map<string, Issue[]>();
  for (const issue of issues) {
    const key = `${issue.file}:${issue.line}:${issue.match}`;
    const group = groups.get(key) ?? [];
    group.push(issue);
    groups.set(key, group);
  }

  const result: Issue[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
    } else {
      group.sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
      );
      result.push(group[0]);
    }
  }

  return result;
}

/**
 * Check if a hardhat config file already imports the unified zksync plugin.
 */
function hasZkSyncPlugin(configContent: string): boolean {
  return (
    configContent.includes("@matterlabs/hardhat-zksync") &&
    !configContent.includes("@matterlabs/hardhat-zksync-solc") &&
    !configContent.includes("@matterlabs/hardhat-zksync-deploy") &&
    !configContent.includes("@matterlabs/hardhat-zksync-verify")
  );
}

/**
 * Check if a package.json has the hardhat-zksync dependency.
 */
function packageHasZkSync(pkgContent: string): boolean {
  try {
    const pkg = JSON.parse(pkgContent);
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    return (
      "@matterlabs/hardhat-zksync" in allDeps ||
      "@matterlabs/hardhat-zksync-solc" in allDeps
    );
  } catch {
    return false;
  }
}

export function scan(targetDir: string): ScanResult {
  if (!existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const issues: Issue[] = [];
  let skippedFiles = 0;

  const solFiles = collectFiles(targetDir, (name) => name.endsWith(".sol"));

  for (const filePath of solFiles) {
    const relPath = relative(targetDir, filePath);
    let content: string;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      skippedFiles++;
      continue;
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip single-line comments
      if (line.trimStart().startsWith("//")) continue;
      // Skip lines inside multi-line comments (simple heuristic)
      if (line.trimStart().startsWith("*") || line.trimStart().startsWith("/*"))
        continue;

      const lineIssues = scanLine(line, i + 1, relPath, solidityRules);
      issues.push(...lineIssues);
    }
  }

  // ── Scan config files ─────────────────────────────────────
  const configFiles: string[] = [];

  // Collect config files from root
  for (const configName of CONFIG_FILES) {
    const configPath = join(targetDir, configName);
    if (existsSync(configPath)) {
      configFiles.push(configPath);
    }
  }

  // Track if this is a hardhat project and if it has zksync
  let isHardhatProject = false;
  let hasZkSync = false;

  for (const configPath of configFiles) {
    const relPath = relative(targetDir, configPath);
    let content: string;
    try {
      content = readFileSync(configPath, "utf8");
    } catch {
      skippedFiles++;
      continue;
    }

    if (relPath.startsWith("hardhat.config")) {
      isHardhatProject = true;
      if (hasZkSyncPlugin(content)) {
        hasZkSync = true;
      }
    }

    if (relPath === "package.json") {
      if (packageHasZkSync(content)) {
        hasZkSync = true;
      }
      // Check for hardhat in deps
      if (content.includes('"hardhat"')) {
        isHardhatProject = true;
      }
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const lineIssues = scanLine(lines[i], i + 1, relPath, configRules);
      issues.push(...lineIssues);
    }
  }

  // If it's a hardhat project without zksync plugin, flag it
  if (isHardhatProject && !hasZkSync) {
    const configFile = configFiles.find((f) =>
      f.includes("hardhat.config"),
    );
    const relPath = configFile
      ? relative(targetDir, configFile)
      : "hardhat.config.ts";
    issues.push({
      severity: CFG002.severity,
      ruleId: CFG002.id,
      file: relPath,
      line: 0,
      match: "",
      title: CFG002.title,
      detail: CFG002.detail,
      fix: CFG002.fix,
      url: CFG002.url,
    });
  }

  const dedupedIssues = deduplicateIssues(issues);

  dedupedIssues.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  const summary: Record<Severity, number> = {
    critical: 0,
    high: 0,
    moderate: 0,
    info: 0,
  };
  for (const issue of dedupedIssues) {
    summary[issue.severity]++;
  }

  const exitCode = summary.critical > 0 ? 2 : dedupedIssues.length > 0 ? 1 : 0;

  return {
    version: "0.1.0",
    issues: dedupedIssues,
    summary,
    totalFiles: solFiles.length + configFiles.length - skippedFiles,
    solidityFiles: solFiles.length,
    configFiles: configFiles.length,
    exitCode,
  };
}