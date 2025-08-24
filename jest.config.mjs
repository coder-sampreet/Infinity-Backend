/** @type {import('jest').Config} */
const config = {
    testEnvironment: "node",
    transform: {
        "^.+\\.(t|j)sx?$": [
            "@swc/jest",
            {
                jsc: {
                    parser: { syntax: "typescript", tsx: false },
                    target: "esnext",
                },
                module: { type: "es6" },
            },
        ],
    },

    extensionsToTreatAsEsm: [".ts"],
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    testMatch: ["<rootDir>/tests/**/*.(spec|test).ts"],

    moduleFileExtensions: ["ts", "js", "json"],
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
    coverageProvider: "v8",
    verbose: true,

    // 👇 Key fix: allow TS files that import with `.js` suffix to resolve
    // e.g. import "../config/env.config.js" -> map to "../config/env.config"
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        // If you use path aliases in tsconfig (optional):
        // "^@/(.*)$": "<rootDir>/src/$1",
    },

    // No setup files needed - NODE_ENV is set in package.json scripts
};

export default config;
