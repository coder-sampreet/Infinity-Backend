import APIError, { type APIErrorDetails } from "../../src/core/APIError.js";
import ERROR_CODES from "../../src/constants/errorCodes.const.js";
import HTTP_STATUS_CODES from "../../src/constants/httpStatusCodes.const.js";

describe("APIError", () => {
    describe("Constructor", () => {
        it("should create APIError with default values", () => {
            // Act
            const error = new APIError();

            // Assert
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(APIError);
            expect(error.name).toBe("APIError");
            expect(error.message).toBe("Internal Server Error");
            expect(error.statusCode).toBe(
                HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            );
            expect(error.errorCode).toBe(ERROR_CODES.INTERNAL_ERROR);
            expect(error.details).toBeNull();
            expect(error.stack).toBeDefined();
        });

        it("should create APIError with custom values", () => {
            // Arrange
            const message = "Custom error message";
            const statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
            const errorCode = ERROR_CODES.BAD_REQUEST;
            const details: APIErrorDetails = {
                field: "email",
                reason: "Invalid format",
            };

            // Act
            const error = new APIError(message, statusCode, errorCode, details);

            // Assert
            expect(error.message).toBe(message);
            expect(error.statusCode).toBe(statusCode);
            expect(error.errorCode).toBe(errorCode);
            expect(error.details).toEqual(details);
        });

        it("should create APIError with partial custom values", () => {
            // Arrange
            const message = "Custom message";
            const statusCode = HTTP_STATUS_CODES.NOT_FOUND;

            // Act
            const error = new APIError(message, statusCode);

            // Assert
            expect(error.message).toBe(message);
            expect(error.statusCode).toBe(statusCode);
            expect(error.errorCode).toBe(ERROR_CODES.INTERNAL_ERROR); // Default
            expect(error.details).toBeNull(); // Default
        });

        it("should capture stack trace", () => {
            // Act
            const error = new APIError("Test error");

            // Assert
            expect(error.stack).toBeDefined();
            expect(typeof error.stack).toBe("string");
            expect(error.stack).toContain("APIError");
        });
    });

    describe("toResponse", () => {
        it("should convert error to standardized response format", () => {
            // Arrange
            const message = "Test error";
            const statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
            const errorCode = ERROR_CODES.BAD_REQUEST;
            const details: APIErrorDetails = { field: "test" };
            const error = new APIError(message, statusCode, errorCode, details);

            // Act
            const response = error.toResponse();

            // Assert
            expect(response).toEqual({
                success: false,
                message,
                errorCode,
                details,
            });
        });

        it("should handle null details", () => {
            // Arrange
            const error = new APIError("Test error");

            // Act
            const response = error.toResponse();

            // Assert
            expect(response.details).toBeNull();
        });

        it("should handle complex details object", () => {
            // Arrange
            const details: APIErrorDetails = {
                field: "email",
                reason: "Invalid format",
                nested: { value: "test" },
                array: [1, 2, 3],
            };
            const error = new APIError(
                "Test error",
                400,
                ERROR_CODES.BAD_REQUEST,
                details,
            );

            // Act
            const response = error.toResponse();

            // Assert
            expect(response.details).toEqual(details);
        });
    });

    describe("Static Methods", () => {
        describe("throwBadRequest", () => {
            it("should throw 400 Bad Request error with default message", () => {
                // Act & Assert
                expect(() => APIError.throwBadRequest()).toThrow(APIError);
                expect(() => APIError.throwBadRequest()).toThrow("Bad Request");
            });

            it("should throw 400 Bad Request error with custom message", () => {
                // Arrange
                const message = "Invalid input data";

                // Act & Assert
                expect(() => APIError.throwBadRequest(message)).toThrow(
                    APIError,
                );
                expect(() => APIError.throwBadRequest(message)).toThrow(
                    message,
                );
            });

            it("should throw 400 Bad Request error with details", () => {
                // Arrange
                const details: APIErrorDetails = { field: "email" };

                // Act & Assert
                expect(() => APIError.throwBadRequest("Test", details)).toThrow(
                    APIError,
                );

                try {
                    APIError.throwBadRequest("Test", details);
                } catch (error) {
                    expect(error).toBeInstanceOf(APIError);
                    expect((error as APIError).statusCode).toBe(
                        HTTP_STATUS_CODES.BAD_REQUEST,
                    );
                    expect((error as APIError).errorCode).toBe(
                        ERROR_CODES.BAD_REQUEST,
                    );
                    expect((error as APIError).details).toEqual(details);
                }
            });
        });

        describe("throwUnauthorized", () => {
            it("should throw 401 Unauthorized error with default message", () => {
                // Act & Assert
                expect(() => APIError.throwUnauthorized()).toThrow(APIError);
                expect(() => APIError.throwUnauthorized()).toThrow(
                    "Unauthorized",
                );
            });

            it("should throw 401 Unauthorized error with custom message and details", () => {
                // Arrange
                const message = "Invalid token";
                const details: APIErrorDetails = { token: "expired" };

                // Act & Assert
                try {
                    APIError.throwUnauthorized(message, details);
                } catch (error) {
                    expect(error).toBeInstanceOf(APIError);
                    expect((error as APIError).statusCode).toBe(
                        HTTP_STATUS_CODES.UNAUTHORIZED,
                    );
                    expect((error as APIError).errorCode).toBe(
                        ERROR_CODES.UNAUTHORIZED,
                    );
                    expect((error as APIError).message).toBe(message);
                    expect((error as APIError).details).toEqual(details);
                }
            });
        });

        describe("throwNotFound", () => {
            it("should throw 404 Not Found error with default message", () => {
                // Act & Assert
                expect(() => APIError.throwNotFound()).toThrow(APIError);
                expect(() => APIError.throwNotFound()).toThrow("Not Found");
            });

            it("should throw 404 Not Found error with custom message and details", () => {
                // Arrange
                const message = "User not found";
                const details: APIErrorDetails = { userId: "123" };

                // Act & Assert
                try {
                    APIError.throwNotFound(message, details);
                } catch (error) {
                    expect(error).toBeInstanceOf(APIError);
                    expect((error as APIError).statusCode).toBe(
                        HTTP_STATUS_CODES.NOT_FOUND,
                    );
                    expect((error as APIError).errorCode).toBe(
                        ERROR_CODES.NOT_FOUND,
                    );
                    expect((error as APIError).message).toBe(message);
                    expect((error as APIError).details).toEqual(details);
                }
            });
        });

        describe("throwInternal", () => {
            it("should throw 500 Internal Server Error with default message", () => {
                // Act & Assert
                expect(() => APIError.throwInternal()).toThrow(APIError);
                expect(() => APIError.throwInternal()).toThrow(
                    "Internal Server Error",
                );
            });

            it("should throw 500 Internal Server Error with custom message and details", () => {
                // Arrange
                const message = "Database connection failed";
                const details: APIErrorDetails = { database: "mongodb" };

                // Act & Assert
                try {
                    APIError.throwInternal(message, details);
                } catch (error) {
                    expect(error).toBeInstanceOf(APIError);
                    expect((error as APIError).statusCode).toBe(
                        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
                    );
                    expect((error as APIError).errorCode).toBe(
                        ERROR_CODES.INTERNAL_ERROR,
                    );
                    expect((error as APIError).message).toBe(message);
                    expect((error as APIError).details).toEqual(details);
                }
            });
        });

        describe("throwConflict", () => {
            it("should throw 409 Conflict error with default message", () => {
                // Act & Assert
                expect(() => APIError.throwConflict()).toThrow(APIError);
                expect(() => APIError.throwConflict()).toThrow("Conflict");
            });

            it("should throw 409 Conflict error with custom message and details", () => {
                // Arrange
                const message = "Email already exists";
                const details: APIErrorDetails = { email: "test@example.com" };

                // Act & Assert
                try {
                    APIError.throwConflict(message, details);
                } catch (error) {
                    expect(error).toBeInstanceOf(APIError);
                    expect((error as APIError).statusCode).toBe(
                        HTTP_STATUS_CODES.CONFLICT,
                    );
                    expect((error as APIError).errorCode).toBe(
                        ERROR_CODES.CONFLICT,
                    );
                    expect((error as APIError).message).toBe(message);
                    expect((error as APIError).details).toEqual(details);
                }
            });
        });
    });

    describe("Error Inheritance", () => {
        it("should be instanceof Error", () => {
            // Act
            const error = new APIError();

            // Assert
            expect(error).toBeInstanceOf(Error);
        });

        it("should have proper prototype chain", () => {
            // Act
            const error = new APIError();

            // Assert
            expect(Object.getPrototypeOf(error)).toBe(APIError.prototype);
            expect(Object.getPrototypeOf(APIError.prototype)).toBe(
                Error.prototype,
            );
        });

        it("should have correct constructor name", () => {
            // Act
            const error = new APIError();

            // Assert
            expect(error.constructor.name).toBe("APIError");
            expect(error.name).toBe("APIError");
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty string message", () => {
            // Act
            const error = new APIError("");

            // Assert
            expect(error.message).toBe("");
        });

        it("should handle very long message", () => {
            // Arrange
            const longMessage = "a".repeat(1000);

            // Act
            const error = new APIError(longMessage);

            // Assert
            expect(error.message).toBe(longMessage);
        });

        it("should handle special characters in message", () => {
            // Arrange
            const specialMessage =
                "Error with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?";

            // Act
            const error = new APIError(specialMessage);

            // Assert
            expect(error.message).toBe(specialMessage);
        });

        it("should handle complex details with various types", () => {
            // Arrange
            const details: APIErrorDetails = {
                string: "test",
                number: 123,
                boolean: true,
                null: null,
                undefined: undefined,
                array: [1, 2, 3],
                object: { nested: "value" },
                function: () => "test",
            };

            // Act
            const error = new APIError(
                "Test",
                400,
                ERROR_CODES.BAD_REQUEST,
                details,
            );

            // Assert
            expect(error.details).toEqual(details);
        });
    });
});
