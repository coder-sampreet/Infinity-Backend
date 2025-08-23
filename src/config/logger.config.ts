//logger.config.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import env, { isDev, isProd } from "./env.config.js";

// --- Resolve file paths (ESM-friendly) ---
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const logDir: string = path.join(_dirname, "../../logs");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Custom log levels with "http" included
 */
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "magenta",
        debug: "blue",
    },
};
winston.addColors(customLevels.colors);

/**
 * Development log format - colorized & human readable
 */
const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
        ({ timestamp, level, message, stack, requestId }) =>
            `${timestamp} [${level}]${requestId ? ` [req:${requestId}]` : ""}: ${
                stack || message
            }`,
    ),
);

/**
 * Production log format - JSON structured logs
 */
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, requestId }) =>
        JSON.stringify({
            timestamp,
            level,
            message,
            ...(stack ? { stack } : {}),
            ...(requestId ? { requestId } : {}),
        }),
    ),
);

/**
 * Always log to console
 */
const transports: winston.transport[] = [
    new winston.transports.Console({
        handleExceptions: true,
    }),
];

/**
 * Only add file logging in production
 */
if (isProd) {
    transports.push(
        // Daily rotated error logs
        new DailyRotateFile({
            filename: path.join(logDir, "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: process.env.LOG_MAX_SIZE || "20m",
            maxFiles: process.env.LOG_MAX_FILES || "30d",
            handleExceptions: true,
        }),

        // Daily rotated combined logs
        new DailyRotateFile({
            filename: path.join(logDir, "combined-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: process.env.LOG_MAX_SIZE || "20m",
            maxFiles: process.env.LOG_MAX_FILES || "14d",
        }),
    );
}

/**
 * Create the logger
 */
const logger = winston.createLogger({
    levels: customLevels.levels,
    level: env.LOG_LEVEL || (isProd ? "info" : "debug"),
    format: isDev ? devFormat : prodFormat,
    transports,
    exitOnError: false,
}) as winston.Logger & { http: winston.LeveledLogMethod }; // add "http" method type

/** Uncaught exceptions & rejections in production */
if (isProd) {
    logger.exceptions.handle(
        new winston.transports.File({
            filename: path.join(logDir, "exceptions.log"),
        }),
    );
    logger.rejections.handle(
        new winston.transports.File({
            filename: path.join(logDir, "rejections.log"),
        }),
    );
}

/** Morgan integration: export a separate stream object */
const morganStream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

export default logger;
export { morganStream };
