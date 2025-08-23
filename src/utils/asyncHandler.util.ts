import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express route handler and forwards any errors
 * to the global error handler middleware.
 *
 * @param fn - An async Express route handler function
 * @returns A wrapped Express handler with error forwarding
 */
const asyncHandler =
    <T extends RequestHandler>(fn: T): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };

export default asyncHandler;
