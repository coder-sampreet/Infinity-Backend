import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{js,ts}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
            parserOptions: {
                project: "./tsconfig.eslint.json",
            },
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: { attributes: false } },
            ],
            "@typescript-eslint/no-floating-promises": "error",
        },
    },
    {
        files: ["tests/**/*.{ts,js}", "**/*.{spec,test}.{ts,js}"],
        languageOptions: { globals: { ...globals.jest, ...globals.node } },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "warn",
        },
    },
    eslintConfigPrettier,
    {
        ignores: ["dist", "logs", "node_modules"],
    },
]);
