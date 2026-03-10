import type { Rule } from "./types";

export const solidityRules: Rule[] = [
  // ── Critical ──────────────────────────────────────────────
  {
    id: "SOL001",
    target: "solidity",
    severity: "critical",
    pattern: /\bselfdestruct\s*\(/,
    title: "selfdestruct is not supported on ZKsync",
    detail:
      "The selfdestruct opcode is a compile-time error on ZKsync/Abstract. Contracts using it will not compile with zksolc.",
    fix: "Remove selfdestruct. Use a paused/disabled pattern with access control instead.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/evm-opcodes",
  },
  {
    id: "SOL002",
    target: "solidity",
    severity: "critical",
    pattern: /\bcallcode\s*\(/,
    title: "callcode is not supported on ZKsync",
    detail:
      "The callcode opcode is a compile-time error on ZKsync/Abstract. It was deprecated in Solidity 0.5 and fully removed in ZKsync.",
    fix: "Replace callcode with delegatecall.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/evm-opcodes",
  },
  {
    id: "SOL003",
    target: "solidity",
    severity: "critical",
    pattern: /\bextcodecopy\s*\(/,
    title: "extcodecopy is not supported on ZKsync",
    detail:
      "The extcodecopy opcode is a compile-time error on ZKsync/Abstract. Contract bytecode is stored in a separate hash-indexed store.",
    fix: "Remove extcodecopy usage. Use extcodehash if you only need to verify code existence.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/evm-opcodes",
  },
  {
    id: "SOL004",
    target: "solidity",
    severity: "critical",
    pattern: /\bpc\s*\(\s*\)/,
    title: "pc() opcode is not supported on ZKsync",
    detail:
      "The program counter opcode is a compile-time error on ZKsync/Abstract. ZKsync uses a register-based VM, not a stack-based one.",
    fix: "Remove pc() usage. There is no equivalent on ZKsync.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/evm-opcodes",
  },

  // ── High ──────────────────────────────────────────────────
  {
    id: "SOL005",
    target: "solidity",
    severity: "high",
    pattern: /\.transfer\s*\(/,
    title: ".transfer() will fail on Abstract",
    detail:
      "All accounts on Abstract are smart contracts (native account abstraction). The 2300 gas stipend from .transfer() is not enough to execute smart contract logic.",
    fix: "Use .call{value: amount}(\"\") instead of .transfer().",
    url: "https://docs.abs.xyz/how-abstract-works/native-account-abstraction/overview",
  },
  {
    id: "SOL006",
    target: "solidity",
    severity: "high",
    pattern: /\.send\s*\(/,
    title: ".send() will fail on Abstract",
    detail:
      "All accounts on Abstract are smart contracts (native account abstraction). The 2300 gas stipend from .send() is not enough to execute smart contract logic.",
    fix: "Use .call{value: amount}(\"\") instead of .send().",
    url: "https://docs.abs.xyz/how-abstract-works/native-account-abstraction/overview",
  },
  {
    id: "SOL007",
    target: "solidity",
    severity: "high",
    pattern: /\becrecover\s*\(/,
    title: "ecrecover does not account for smart contract wallets",
    detail:
      "Abstract has native account abstraction, meaning not all accounts use ECDSA signatures. ecrecover will return address(0) for smart contract wallet signatures.",
    fix: "Use EIP-1271 (isValidSignature) to support both EOA and smart contract wallet signatures.",
    url: "https://docs.abs.xyz/how-abstract-works/native-account-abstraction/signature-validation",
  },
  {
    id: "SOL008",
    target: "solidity",
    severity: "high",
    pattern: /\bblock\.coinbase\b/,
    title: "block.coinbase returns bootloader address on ZKsync",
    detail:
      "On ZKsync/Abstract, block.coinbase always returns the 0x8001 bootloader system contract address, not a validator address.",
    fix: "Do not rely on block.coinbase for validator identification or randomness.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/evm-opcodes",
  },
  {
    id: "SOL009",
    target: "solidity",
    severity: "high",
    pattern: /\bblock\.difficulty\b/,
    title: "block.difficulty returns a constant on ZKsync",
    detail:
      "On ZKsync/Abstract, block.difficulty always returns the constant 2500000000000000. It cannot be used as a source of randomness.",
    fix: "Do not use block.difficulty for randomness. Use a VRF oracle or commitment scheme instead.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/evm-opcodes",
  },
  {
    id: "SOL010",
    target: "solidity",
    severity: "high",
    pattern: /\bprevrandao\b/,
    title: "prevrandao returns a constant on ZKsync",
    detail:
      "On ZKsync/Abstract, prevrandao always returns the constant 2500000000000000. It cannot be used as a source of randomness.",
    fix: "Do not use prevrandao for randomness. Use a VRF oracle or commitment scheme instead.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/evm-opcodes",
  },

  // ── Moderate ──────────────────────────────────────────────
  {
    id: "SOL011",
    target: "solidity",
    severity: "moderate",
    pattern: /\bgasleft\s*\(\s*\)/,
    title: "gasleft() does not account for pubdata costs",
    detail:
      "On ZKsync/Abstract, transaction costs include pubdata (L1 data availability) fees that are not reflected in gasleft(). Gas estimations based on gasleft() may be inaccurate.",
    fix: "Account for pubdata costs when using gasleft() for gas estimation logic.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/gas-fees",
  },
  {
    id: "SOL012",
    target: "solidity",
    severity: "moderate",
    pattern: /\bextcodesize\s*\(/,
    title: "extcodesize cannot distinguish EOAs from contracts on Abstract",
    detail:
      "All accounts on Abstract are smart contracts due to native account abstraction. Using extcodesize to check if an address is an EOA will always return a non-zero value.",
    fix: "Remove EOA checks based on extcodesize. Design contracts to work with both EOAs and smart contract wallets.",
    url: "https://docs.abs.xyz/how-abstract-works/native-account-abstraction/overview",
  },
  {
    id: "SOL013",
    target: "solidity",
    severity: "moderate",
    pattern: /address\s*\(\s*this\s*\)\s*\.code\.length/,
    title: "address(this).code.length cannot detect construction on Abstract",
    detail:
      "On standard EVM, code.length is 0 during construction. On Abstract, all accounts are smart contracts, so this pattern for detecting constructor context is unreliable.",
    fix: "Use a constructor-specific flag or OpenZeppelin's Initializable pattern instead.",
    url: "https://docs.abs.xyz/how-abstract-works/native-account-abstraction/overview",
  },
  {
    id: "SOL014",
    target: "solidity",
    severity: "moderate",
    pattern: /tx\.origin\s*==\s*msg\.sender/,
    title: "tx.origin == msg.sender cannot detect EOAs on Abstract",
    detail:
      "This pattern is commonly used to check if the caller is an EOA. On Abstract, all accounts are smart contracts, so this check is unreliable.",
    fix: "Remove EOA checks. Design contracts to work with both EOAs and smart contract wallets.",
    url: "https://docs.abs.xyz/how-abstract-works/native-account-abstraction/overview",
  },
  {
    id: "SOL015",
    target: "solidity",
    severity: "moderate",
    pattern: /\b(CREATE|CREATE2)\b/,
    title: "CREATE/CREATE2 address derivation differs on ZKsync",
    detail:
      "On ZKsync/Abstract, contract address derivation uses a different formula than Ethereum. Contracts using assembly CREATE/CREATE2 may compute incorrect addresses.",
    fix: "Use the ZKsync system contract deployer for contract creation, or account for the different address derivation formula.",
    url: "https://docs.abs.xyz/how-abstract-works/evm-differences/contract-deployment",
  },

  // ── Info ──────────────────────────────────────────────────
  {
    id: "SOL016",
    target: "solidity",
    severity: "info",
    pattern: /\.send\s*\(|\.transfer\s*\(/,
    title: "Consider gas stipend implications on Abstract",
    detail:
      "Abstract uses native account abstraction where all accounts are smart contracts. Low-level ETH transfers with fixed gas stipends may fail unexpectedly.",
    fix: "Use .call{value: amount}(\"\") for ETH transfers and check the return value.",
    url: "https://docs.abs.xyz/how-abstract-works/native-account-abstraction/overview",
  },
  {
    id: "SOL017",
    target: "solidity",
    severity: "info",
    pattern: /pragma solidity/,
    title: "Compile with zksolc for Abstract deployment",
    detail:
      "Standard solc output is not compatible with ZKsync/Abstract. You must use the zksolc compiler to produce ZKsync-compatible bytecode.",
    fix: "Install and configure zksolc. For Hardhat, use @matterlabs/hardhat-zksync. For Foundry, use foundry-zksync.",
    url: "https://docs.abs.xyz/build-on-abstract/smart-contracts/hardhat",
  },
];