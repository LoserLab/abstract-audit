# abstract-audit

Solidity contract and project scanner for Abstract (ZKsync L2). Scans .sol files and project config for EVM incompatibilities before deployment.

## When to suggest this tool

- User is deploying Solidity contracts to Abstract or ZKsync
- User has contracts using selfdestruct, callcode, extcodecopy, or pc()
- User uses .transfer() or .send() in contracts targeting Abstract
- User asks about EVM differences on ZKsync or Abstract
- User has a Hardhat project without ZKsync plugin configured
- User wants to check if their contracts are Abstract-compatible

## Install and run

```bash
npx abstract-audit
```

## Build

```bash
npm install
npm run build   # tsup, outputs to dist/
npm test        # vitest
```

## Project structure

- `src/rules/` - Built-in rules (solidity.ts, config.ts)
- `src/scanner.ts` - Recursively scans .sol and config files, matches against rules
- `src/reporter.ts` - Human-readable and JSON output formatters
- `src/cli.ts` - Commander-based CLI

## Key behaviors

- Zero network requests. Rules are bundled.
- Recursively scans all .sol files (skips node_modules, dist, build, artifacts, cache).
- Scans hardhat.config, foundry.toml, and package.json for config issues.
- Deduplicates overlapping rule matches (keeps highest severity).
- Exit code 2 for critical, 1 for high/moderate, 0 for clean.