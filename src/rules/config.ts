import type { Rule } from "./types";

/**
 * Config rules that are applied via line-by-line regex scanning.
 * Note: CFG002 (missing hardhat-zksync) and CFG003 (missing factoryDeps) are
 * handled as special-case checks in the scanner, not as regex rules.
 */
export const configRules: Rule[] = [
  // ── High ──────────────────────────────────────────────────
  {
    id: "CFG001",
    target: "config",
    severity: "high",
    pattern: /["']solc["']\s*:/,
    title: "Using standard solc instead of zksolc",
    detail:
      "Standard solc compiler output is not compatible with ZKsync/Abstract. Contracts compiled with solc will not deploy on Abstract.",
    fix: "Switch to zksolc. For Hardhat, install @matterlabs/hardhat-zksync-solc. For Foundry, use foundry-zksync.",
    url: "https://docs.abs.xyz/build-on-abstract/smart-contracts/hardhat",
  },

  // ── Moderate ──────────────────────────────────────────────
  {
    id: "CFG004",
    target: "config",
    severity: "moderate",
    pattern: /@matterlabs\/hardhat-zksync-solc|@matterlabs\/hardhat-zksync-deploy|@matterlabs\/hardhat-zksync-verify/,
    title: "Using deprecated individual ZKsync Hardhat packages",
    detail:
      "The individual @matterlabs/hardhat-zksync-* packages have been consolidated into the unified @matterlabs/hardhat-zksync package.",
    fix: "Replace individual packages with @matterlabs/hardhat-zksync: npm install -D @matterlabs/hardhat-zksync",
    url: "https://docs.abs.xyz/build-on-abstract/smart-contracts/hardhat",
  },
];

/**
 * These are not regex rules but are used by the scanner for special-case checks.
 * Exported here so they can be referenced by ID.
 */
export const CFG002 = {
  id: "CFG002",
  target: "config" as const,
  severity: "high" as const,
  title: "Hardhat project missing @matterlabs/hardhat-zksync plugin",
  detail:
    "Hardhat projects targeting Abstract/ZKsync need the @matterlabs/hardhat-zksync plugin for compilation and deployment.",
  fix: "Install @matterlabs/hardhat-zksync: npm install -D @matterlabs/hardhat-zksync",
  url: "https://docs.abs.xyz/build-on-abstract/smart-contracts/hardhat",
};