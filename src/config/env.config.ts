// env.config.ts
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { z } from "zod";

// --- Resolve project paths (ESM-friendly) ---
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Load environment file based on NODE_ENV (defaults to "development")
const rawNodeEnv = process.env.NODE_ENV || "development";
const envFile = `.env.${rawNodeEnv}`;
dotenv.config({ path: path.resolve(_dirname, "../../", envFile) });

// --- Zod schema for validating environment variables ---
// - Ensures required variables are present
// - Applies defaults for optional ones
export const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.string().default("info"),

    ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
    ACCESS_TOKEN_EXPIRY: z.string().default("60m"),

    REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
    REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    DB_NAME: z.string().min(1, "DB_NAME is required"),

    CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
});

/**
 * Parse and validate process.env against the Zod schema.
 *
 * - Logs all validation errors if any variable is missing/invalid.
 * - Exits the process with code 1 if validation fails.
 * - Returns a strongly typed and validated `env` object otherwise.
 */
const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error(
            `❌ Invalid environment configuration!! (from ${envFile}):`,
        );
        parsed.error.issues.forEach((issue) => {
            console.error(`• ${issue.path.join(".")}: ${issue.message}`);
        });
        process.exit(1); // instead of throwing, exit gracefully
    }
    return parsed.data;
};

// Run validation immediately at startup
const env = parseEnv();

// Convenience flags for environment checks
const isProd = env.NODE_ENV === "production";
const isDev = env.NODE_ENV === "development";
const isTest = env.NODE_ENV === "test";

// Exports
// - env: strongly typed validated environment config
// - Env: TS type inferred from schema
// - isProd/isDev/isTest: helper flags for conditional logic
export type Env = z.infer<typeof envSchema>;
export default env as Env;

export { isProd, isDev, isTest };
