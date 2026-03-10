import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "bin/abstract-audit": "bin/abstract-audit.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  shims: true,
});