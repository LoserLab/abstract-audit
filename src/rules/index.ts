import { solidityRules } from "./solidity";
import { configRules } from "./config";
import type { Rule } from "./types";

export const allRules: Rule[] = [...solidityRules, ...configRules];

export { solidityRules, configRules };
export type { Rule, Severity, Issue, ScanResult, RuleTarget } from "./types";