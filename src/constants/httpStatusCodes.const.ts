// httpStatusCodes.const.ts
const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    TOO_MANY_REQUESTS: 429,
} as const;

export type HttpStatusCode =
    (typeof HTTP_STATUS_CODES)[keyof typeof HTTP_STATUS_CODES];
export default HTTP_STATUS_CODES;
