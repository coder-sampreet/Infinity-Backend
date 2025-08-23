import type { Response } from "express";
import HTTP_STATUS_CODES, {
    type HttpStatusCode,
} from "../constants/httpStatusCodes.const.js";

interface IAPIResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T | null;
}

class APIResponse<T = unknown> {
    public success: boolean;
    public message: string;
    public data: T | null;
    public statusCode: HttpStatusCode;

    constructor(
        message: string = "success",
        data: T | null = null,
        statusCode: HttpStatusCode = HTTP_STATUS_CODES.OK,
    ) {
        this.success = true;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }

    public send(res: Response): Response<IAPIResponse<T>> {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            data: this.data,
        });
    }

    public static send<T>(
        res: Response,
        {
            message = "success",
            data = null,
            statusCode = HTTP_STATUS_CODES.OK,
        }: {
            message?: string;
            data?: T | null;
            statusCode?: HttpStatusCode;
        },
    ): Response<IAPIResponse<T>> {
        return res.status(statusCode).json({
            success: true,
            message,
            data: data ?? null,
        });
    }
    public static ok<T>(
        res: Response,
        data: T | null = null,
        message: string = "OK",
    ): Response<IAPIResponse<T>> {
        return this.send<T>(res, {
            statusCode: HTTP_STATUS_CODES.OK,
            message,
            data,
        });
    }

    /** Send a 201 Created response */
    public static created<T>(
        res: Response,
        data: T | null = null,
        message: string = "Resource created",
    ): Response<IAPIResponse<T>> {
        return this.send<T>(res, {
            statusCode: HTTP_STATUS_CODES.CREATED,
            message,
            data,
        });
    }
}

export type { IAPIResponse };
export default APIResponse;
