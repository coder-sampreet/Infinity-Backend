// APIError.ts
import ERROR_CODES, { type ErrorCode } from "../constants/errorCodes.const.js";
import HTTP_STATUS_CODES, {
    type HttpStatusCode,
} from "../constants/httpStatusCodes.const.js";

/**
 * Shape for optional error metadata passed with an API error.
 *
 * Example:
 * ```ts
 * { field: "email", reason: "Invalid format" }
 * ```
 */
interface APIErrorDetails {
    [key: string]: unknown;
}

/**
 * Custom APIError class that standardizes error handling across the app.
 *
 * Extends the native Error object with:
 * - HTTP status code
 * - Internal error code
 * - Optional structured details
 *
 * Provides static helper methods for common HTTP errors.
 */
class APIError extends Error {
    /** HTTP status code (e.g. 400, 404, 500) */
    public statusCode: HttpStatusCode;

    /** Internal application-specific error code */
    public errorCode: ErrorCode;

    /** Optional metadata about the error (validation info, debug context, etc.) */
    public details: APIErrorDetails | null;

    /**
     * Construct a new APIError instance.
     *
     * @param {string}message    Human-readable error message.
     * @param {HttpStatusCode}statusCode HTTP status code (default: 500).
     * @param {ErrorCode}errorCode  Internal error code (default: INTERNAL_ERROR).
     * @param {APIErrorDetails}details    Optional error metadata (default: null).
     */
    constructor(
        message: string = "Internal Server Error",
        statusCode: HttpStatusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
        details: APIErrorDetails | null = null,
    ) {
        super(message);

        // Set error name explicitly for debugging / stack traces
        this.name = this.constructor.name;

        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;

        // Capture stack trace (Node.js specific optimization)
        Error.captureStackTrace?.(this, this.constructor);
    }

    /**
     * Convert the error into a standardized JSON response.
     * Useful for sending consistent error responses in Express.
     */
    public toResponse(): {
        success: false;
        message: string;
        errorCode: ErrorCode;
        details: APIErrorDetails | null;
    } {
        return {
            success: false,
            message: this.message,
            errorCode: this.errorCode,
            details: this.details,
        };
    }

    // Static helper methods for common error types
    // Each one throws a pre-configured APIError instance

    /** Throw a 400 Bad Request error */
    public static throwBadRequest(
        message = "Bad Request",
        details: APIErrorDetails | null = null,
    ): never {
        throw new APIError(
            message,
            HTTP_STATUS_CODES.BAD_REQUEST,
            ERROR_CODES.BAD_REQUEST,
            details,
        );
    }

    /** Throw a 401 Unauthorized error */
    public static throwUnauthorized(
        message = "Unauthorized",
        details: APIErrorDetails | null = null,
    ): never {
        throw new APIError(
            message,
            HTTP_STATUS_CODES.UNAUTHORIZED,
            ERROR_CODES.UNAUTHORIZED,
            details,
        );
    }

    /** Throw a 404 Not Found error */
    public static throwNotFound(
        message = "Not Found",
        details: APIErrorDetails | null = null,
    ): never {
        throw new APIError(
            message,
            HTTP_STATUS_CODES.NOT_FOUND,
            ERROR_CODES.NOT_FOUND,
            details,
        );
    }

    /** Throw a 500 Internal Server Error */
    public static throwInternal(
        message = "Internal Server Error",
        details: APIErrorDetails | null = null,
    ): never {
        throw new APIError(
            message,
            HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            details,
        );
    }

    /** Throw a 409 Conflict error */
    public static throwConflict(
        message = "Conflict",
        details: APIErrorDetails | null = null,
    ): never {
        throw new APIError(
            message,
            HTTP_STATUS_CODES.CONFLICT,
            ERROR_CODES.CONFLICT,
            details,
        );
    }
}

export { APIError };
export type { APIErrorDetails };
export default APIError;
