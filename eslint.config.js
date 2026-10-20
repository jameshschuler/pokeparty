import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", ".tanstack", "src/routeTree.gen.ts"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { "@stylistic": stylistic },
    languageOptions: { globals: globals.browser },
    rules: {
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: ["return", "if"] },
      ],
    },
  },
  {
    files: ["scripts/**", "*.config.{js,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/routes/**", "src/contexts/**"],
    rules: { "react-refresh/only-export-components": "off" },
  },
]);
