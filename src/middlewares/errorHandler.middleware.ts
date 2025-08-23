// errorHandler.middleware.ts
import type { Request, Response, NextFunction } from "express";
import APIError from "../core/APIError.js";
import ERROR_CODES from "../constants/errorCodes.const.js";
import HTTP_STATUS_CODES, {
    type HttpStatusCode,
} from "../constants/httpStatusCodes.const.js";
import logger from "../config/logger.config.js";
import { isDev } from "../config/env.config.js";

/**
 * Utility type for narrowing unknown values into objects.
 */
type UnknownObject = Record<string, unknown>;

/**
 * Type guard: checks if a value has a numeric `statusCode` property.
 */
const hasNumberStatusCode = (e: unknown): e is { statusCode: number } => {
    return (
        typeof e === "object" &&
        e !== null &&
        typeof (e as UnknownObject).statusCode === "number"
    );
};

/**
 * Type guard: checks if a value has a string `message` property.
 */
const hasStringMessage = (e: unknown): e is { message: string } => {
    return (
        typeof e === "object" &&
        e !== null &&
        typeof (e as UnknownObject).message === "string"
    );
};

/**
 * Global error handler middleware for Express.
 *
 * - Normalizes all errors into `APIError` instances.
 * - Sends consistent JSON responses for both known and unknown errors.
 * - Logs unexpected errors.
 * - In development mode, includes stack trace and raw error details.
 *
 * @param {unknown}err - The error that was thrown or passed to `next()`.
 * @param {Request}_req - The Express request (unused here, but required by Express).
 * @param {Response}res - The Express response used to send the error payload.
 * @param {NextFunction}_next - The Express `next` function (unused here, but required by Express).
 */
const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    // If the error is already an APIError, use it directly
    if (err instanceof APIError) {
        return res.status(err.statusCode).json(err.toResponse());
    }

    // Log unexpected/unhandled errors for debugging
    logger.debug("Unhandled Error:", err);

    // Extract statusCode if available, otherwise default to 500 (Internal Server Error)
    const statusCode: HttpStatusCode = hasNumberStatusCode(err)
        ? (err.statusCode as HttpStatusCode)
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

    // Only include stack trace + raw error in development mode
    const details =
        isDev && err instanceof Error
            ? { stack: err.stack, originalError: err }
            : null;

    // Use the error message if available, otherwise a generic fallback
    const message = hasStringMessage(err)
        ? err.message
        : "Internal Server Error";

    // Wrap everything into a standardized APIError
    const fallbackError = new APIError(
        message,
        statusCode,
        ERROR_CODES.UNEXPECTED_ERROR,
        details,
    );

    // Send the error response in consistent format
    return res
        .status(fallbackError.statusCode)
        .json(fallbackError.toResponse());
};

export default errorHandler;
