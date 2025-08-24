import APIResponse from "../../src/core/APIResponse.js";
import HTTP_STATUS_CODES from "../../src/constants/httpStatusCodes.const.js";
import type { Response } from "express";

// Mock Express Response
const createMockResponse = (): jest.Mocked<Response> => {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Response>;
    return res;
};

describe("APIResponse", () => {
    let mockRes: jest.Mocked<Response>;

    beforeEach(() => {
        mockRes = createMockResponse();
        jest.clearAllMocks();
    });

    describe("Constructor", () => {
        it("should create APIResponse with default values", () => {
            // Act
            const response = new APIResponse();

            // Assert
            expect(response.success).toBe(true);
            expect(response.message).toBe("success");
            expect(response.data).toBeNull();
            expect(response.statusCode).toBe(HTTP_STATUS_CODES.OK);
        });

        it("should create APIResponse with custom values", () => {
            // Arrange
            const message = "Custom message";
            const data = { id: 1, name: "test" };
            const statusCode = HTTP_STATUS_CODES.CREATED;

            // Act
            const response = new APIResponse(message, data, statusCode);

            // Assert
            expect(response.success).toBe(true);
            expect(response.message).toBe(message);
            expect(response.data).toBe(data);
            expect(response.statusCode).toBe(statusCode);
        });

        it("should create APIResponse with partial custom values", () => {
            // Arrange
            const message = "Custom message";
            const data = { test: "value" };

            // Act
            const response = new APIResponse(message, data);

            // Assert
            expect(response.success).toBe(true);
            expect(response.message).toBe(message);
            expect(response.data).toBe(data);
            expect(response.statusCode).toBe(HTTP_STATUS_CODES.OK); // Default
        });
    });

    describe("send method", () => {
        it("should send response with correct status and JSON", () => {
            // Arrange
            const response = new APIResponse(
                "Test message",
                { data: "test" },
                HTTP_STATUS_CODES.CREATED,
            );

            // Act
            const result = response.send(mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(
                HTTP_STATUS_CODES.CREATED,
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Test message",
                data: { data: "test" },
            });
            expect(result).toBe(mockRes);
        });

        it("should send response with default values", () => {
            // Arrange
            const response = new APIResponse();

            // Act
            response.send(mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "success",
                data: null,
            });
        });

        it("should handle null data", () => {
            // Arrange
            const response = new APIResponse("Test", null);

            // Act
            response.send(mockRes);

            // Assert
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Test",
                data: null,
            });
        });

        it("should handle complex data objects", () => {
            // Arrange
            const complexData = {
                user: {
                    id: 1,
                    name: "John",
                    email: "john@example.com",
                    preferences: {
                        theme: "dark",
                        notifications: true,
                    },
                },
                metadata: {
                    createdAt: new Date(),
                    version: "1.0.0",
                },
            };
            const response = new APIResponse("User created", complexData);

            // Act
            response.send(mockRes);

            // Assert
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "User created",
                data: complexData,
            });
        });
    });

    describe("Static send method", () => {
        it("should send response with default parameters", () => {
            // Act
            const result = APIResponse.send(mockRes, {});

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "success",
                data: null,
            });
            expect(result).toBe(mockRes);
        });

        it("should send response with custom parameters", () => {
            // Arrange
            const message = "Custom message";
            const data = { id: 123 };
            const statusCode = HTTP_STATUS_CODES.CREATED;

            // Act
            APIResponse.send(mockRes, {
                message,
                data,
                statusCode,
            });

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(statusCode);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
            });
        });

        it("should send response with partial custom parameters", () => {
            // Arrange
            const data = { test: "value" };

            // Act
            APIResponse.send(mockRes, { data });

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "success",
                data,
            });
        });

        it("should handle undefined data as null", () => {
            // Act
            APIResponse.send(mockRes, { data: undefined });

            // Assert
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "success",
                data: null,
            });
        });
    });

    describe("Static ok method", () => {
        it("should send 200 OK response with default values", () => {
            // Act
            const result = APIResponse.ok(mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "OK",
                data: null,
            });
            expect(result).toBe(mockRes);
        });

        it("should send 200 OK response with custom data", () => {
            // Arrange
            const data = { users: [{ id: 1, name: "John" }] };

            // Act
            APIResponse.ok(mockRes, data);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "OK",
                data,
            });
        });

        it("should send 200 OK response with custom message and data", () => {
            // Arrange
            const message = "Users retrieved successfully";
            const data = { count: 5, users: [] };

            // Act
            APIResponse.ok(mockRes, data, message);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS_CODES.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
            });
        });
    });

    describe("Static created method", () => {
        it("should send 201 Created response with default values", () => {
            // Act
            const result = APIResponse.created(mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(
                HTTP_STATUS_CODES.CREATED,
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Resource created",
                data: null,
            });
            expect(result).toBe(mockRes);
        });

        it("should send 201 Created response with custom data", () => {
            // Arrange
            const data = { id: 123, name: "New User" };

            // Act
            APIResponse.created(mockRes, data);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(
                HTTP_STATUS_CODES.CREATED,
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Resource created",
                data,
            });
        });

        it("should send 201 Created response with custom message and data", () => {
            // Arrange
            const message = "User account created successfully";
            const data = { userId: 456, email: "user@example.com" };

            // Act
            APIResponse.created(mockRes, data, message);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(
                HTTP_STATUS_CODES.CREATED,
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
            });
        });
    });

    describe("Response Format Consistency", () => {
        it("should always return success: true", () => {
            // Act
            const response = new APIResponse(
                "Test",
                { data: "test" },
                HTTP_STATUS_CODES.BAD_REQUEST,
            );

            // Assert
            expect(response.success).toBe(true);
        });

        it("should maintain consistent response structure", () => {
            // Arrange
            const testCases = [
                {
                    message: "Test 1",
                    data: null,
                    statusCode: HTTP_STATUS_CODES.OK,
                },
                {
                    message: "Test 2",
                    data: { id: 1 },
                    statusCode: HTTP_STATUS_CODES.CREATED,
                },
                {
                    message: "Test 3",
                    data: [],
                    statusCode: HTTP_STATUS_CODES.OK,
                },
            ];

            testCases.forEach(({ message, data, statusCode }) => {
                // Act
                const response = new APIResponse(message, data, statusCode);
                response.send(mockRes);

                // Assert
                expect(mockRes.json).toHaveBeenCalledWith({
                    success: true,
                    message,
                    data,
                });
                expect(mockRes.status).toHaveBeenCalledWith(statusCode);
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty string message", () => {
            // Act
            const response = new APIResponse("", { data: "test" });

            // Assert
            expect(response.message).toBe("");
        });

        it("should handle very long message", () => {
            // Arrange
            const longMessage = "a".repeat(1000);

            // Act
            const response = new APIResponse(longMessage);

            // Assert
            expect(response.message).toBe(longMessage);
        });

        it("should handle special characters in message", () => {
            // Arrange
            const specialMessage =
                "Response with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?";

            // Act
            const response = new APIResponse(specialMessage);

            // Assert
            expect(response.message).toBe(specialMessage);
        });

        it("should handle various data types", () => {
            // Arrange
            const testData = [
                null,
                undefined,
                "",
                "string",
                123,
                true,
                false,
                [],
                {},
                { nested: { value: "test" } },
                [1, 2, 3],
                new Date(),
            ];

            testData.forEach((data) => {
                // Act
                const response = new APIResponse("Test", data as unknown);

                // Assert
                if (data === undefined) {
                    expect(response.data).toBeNull();
                } else {
                    expect(response.data).toBe(data);
                }
            });
        });

        it("should handle function as data", () => {
            // Arrange
            const testFunction = () => "test";

            // Act
            const response = new APIResponse("Test", testFunction as unknown);

            // Assert
            expect(response.data).toBe(testFunction);
        });
    });

    describe("Method Chaining", () => {
        it("should support method chaining for send", () => {
            // Arrange
            const response = new APIResponse("Test", { data: "test" });

            // Act
            const result = response.send(mockRes);

            // Assert
            expect(result).toBe(mockRes);
            expect(mockRes.status).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalled();
        });

        it("should support method chaining for static methods", () => {
            // Act
            const result = APIResponse.ok(mockRes);

            // Assert
            expect(result).toBe(mockRes);
        });
    });
});
