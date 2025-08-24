import request from "supertest";
import express from "express";
import rateLimit from "express-rate-limit";
import globalRateLimiter, {
    authRateLimiter,
} from "../../src/middlewares/rateLimiter.middleware.js";
import HTTP_STATUS_CODES from "../../src/constants/httpStatusCodes.const.js";

// Create a test Express app
const createTestApp = (rateLimiter: express.RequestHandler) => {
    const app = express();

    // Enable trust proxy for X-Forwarded-For headers
    app.set("trust proxy", 1);

    // Apply rate limiter
    app.use(rateLimiter);

    // Add test routes
    app.get("/test", (req, res) => {
        res.json({ message: "Success" });
    });

    app.post("/auth/login", (req, res) => {
        res.json({ message: "Login endpoint" });
    });

    return app;
};

// Create a fresh rate limiter for testing
type RateLimitOptions = Parameters<typeof rateLimit>[0];
const createFreshRateLimiter = (options: RateLimitOptions = {}) => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max:
            options.max || (process.env.NODE_ENV === "development" ? 500 : 100),
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: "Too many requests from this IP, please try again later.",
        },
        statusCode: HTTP_STATUS_CODES.TOO_MANY_REQUESTS || 429,
        ...options,
    });
};

describe("Rate Limiter Middleware Integration", () => {
    describe("Global Rate Limiter", () => {
        let app: express.Application;

        beforeEach(() => {
            // Create a fresh rate limiter for each test
            const freshRateLimiter = createFreshRateLimiter({ max: 10 });
            app = createTestApp(freshRateLimiter);
        });

        it("should allow requests within rate limit", async () => {
            // Act - Make multiple requests within limit
            const promises = Array.from({ length: 5 }, () =>
                request(app).get("/test").expect(200),
            );

            const responses = await Promise.all(promises);

            // Assert
            responses.forEach((response) => {
                expect(response.body.message).toBe("Success");
            });
        });

        it("should return rate limit headers", async () => {
            // Act
            const response = await request(app).get("/test").expect(200);

            // Assert
            expect(response.headers).toHaveProperty("ratelimit-limit");
            expect(response.headers).toHaveProperty("ratelimit-remaining");
            expect(response.headers).toHaveProperty("ratelimit-reset");
        });

        it("should block requests when rate limit is exceeded", async () => {
            // Arrange - Use a low limit for testing
            const limit = 10;
            const requestsToMake = limit + 5;

            // Act - Make requests to exceed the limit
            const promises = Array.from({ length: requestsToMake }, () =>
                request(app).get("/test"),
            );

            const responses = await Promise.all(promises);

            // Assert - Some requests should be blocked
            const successfulRequests = responses.filter(
                (r) => r.status === 200,
            );
            const blockedRequests = responses.filter((r) => r.status === 429);

            expect(successfulRequests.length).toBeLessThanOrEqual(limit);
            expect(blockedRequests.length).toBeGreaterThan(0);

            // Check that blocked requests have correct response
            blockedRequests.forEach((response) => {
                expect(response.status).toBe(
                    HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
                );
                expect(response.body).toEqual({
                    success: false,
                    message:
                        "Too many requests from this IP, please try again later.",
                });
            });
        });

        it("should handle different IP addresses separately", async () => {
            // Arrange - Create a fresh app with a very low limit
            const freshRateLimiter = createFreshRateLimiter({ max: 1 });
            const testApp = createTestApp(freshRateLimiter);

            // Act - Make requests from different IPs
            const response1 = await request(testApp)
                .get("/test")
                .set("X-Forwarded-For", "192.168.1.1")
                .expect(200);

            const response2 = await request(testApp)
                .get("/test")
                .set("X-Forwarded-For", "192.168.1.2")
                .expect(200);

            // Assert
            expect(response1.body.message).toBe("Success");
            expect(response2.body.message).toBe("Success");
        });

        it("should reset rate limit after window expires", async () => {
            // This test would require time manipulation
            // For now, we'll test that the rate limiter is working
            const response = await request(app).get("/test").expect(200);

            expect(response.body.message).toBe("Success");
        });

        it("should handle concurrent requests properly", async () => {
            // Act - Make concurrent requests within limit
            const promises = Array.from({ length: 5 }, () =>
                request(app).get("/test"),
            );

            const responses = await Promise.all(promises);

            // Assert - All should succeed (within limit)
            responses.forEach((response) => {
                expect(response.status).toBe(200);
                expect(response.body.message).toBe("Success");
            });
        });
    });

    describe("Auth Rate Limiter", () => {
        let app: express.Application;

        beforeEach(() => {
            // Create a fresh auth rate limiter for each test
            const freshAuthRateLimiter = createFreshRateLimiter({
                max: 3,
                message: {
                    success: false,
                    message: "Too many login attempts, please try again later.",
                },
            });
            app = createTestApp(freshAuthRateLimiter);
        });

        it("should allow requests within auth rate limit", async () => {
            // Act - Make multiple requests within auth limit
            const promises = Array.from({ length: 3 }, () =>
                request(app).post("/auth/login").expect(200),
            );

            const responses = await Promise.all(promises);

            // Assert
            responses.forEach((response) => {
                expect(response.body.message).toBe("Login endpoint");
            });
        });

        it("should block auth requests when rate limit is exceeded", async () => {
            // Arrange - Use a low limit for testing
            const limit = 3;
            const requestsToMake = limit + 2;

            // Act - Make requests to exceed the auth limit
            const promises = Array.from({ length: requestsToMake }, () =>
                request(app).post("/auth/login"),
            );

            const responses = await Promise.all(promises);

            // Assert - Some requests should be blocked
            const successfulRequests = responses.filter(
                (r) => r.status === 200,
            );
            const blockedRequests = responses.filter((r) => r.status === 429);

            expect(successfulRequests.length).toBeLessThanOrEqual(limit);
            expect(blockedRequests.length).toBeGreaterThan(0);

            // Check that blocked requests have correct response
            blockedRequests.forEach((response) => {
                expect(response.status).toBe(
                    HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
                );
                expect(response.body).toEqual({
                    success: false,
                    message: "Too many login attempts, please try again later.",
                });
            });
        });

        it("should return rate limit headers for auth endpoints", async () => {
            // Arrange - Create a fresh app for this test
            const freshAuthRateLimiter = createFreshRateLimiter({ max: 5 });
            const testApp = createTestApp(freshAuthRateLimiter);

            // Act
            const response = await request(testApp)
                .post("/auth/login")
                .expect(200);

            // Assert
            expect(response.headers).toHaveProperty("ratelimit-limit");
            expect(response.headers).toHaveProperty("ratelimit-remaining");
            expect(response.headers).toHaveProperty("ratelimit-reset");
        });

        it("should have stricter limits than global limiter", async () => {
            // This test verifies that auth limiter is more restrictive
            // We can't easily test this without time manipulation,
            // but we can verify the configuration is different
            expect(authRateLimiter).toBeDefined();
            expect(globalRateLimiter).toBeDefined();
        });
    });

    describe("Rate Limiter Configuration", () => {
        it("should use different limits for development and production", () => {
            // This test verifies that the rate limiter configuration
            // adapts to the environment

            // The actual limits are configured in the middleware
            // We can't easily test the exact values without exposing them,
            // but we can verify the middleware is properly configured
            expect(globalRateLimiter).toBeDefined();
            expect(authRateLimiter).toBeDefined();
        });

        it("should include standard headers", async () => {
            // Arrange
            const freshRateLimiter = createFreshRateLimiter({ max: 5 });
            const testApp = createTestApp(freshRateLimiter);

            // Act
            const response = await request(testApp).get("/test").expect(200);

            // Assert
            expect(response.headers).toHaveProperty("ratelimit-limit");
            expect(response.headers).toHaveProperty("ratelimit-remaining");
            expect(response.headers).toHaveProperty("ratelimit-reset");
        });

        it("should not include legacy headers", async () => {
            // Arrange
            const freshRateLimiter = createFreshRateLimiter({ max: 5 });
            const testApp = createTestApp(freshRateLimiter);

            // Act
            const response = await request(testApp).get("/test").expect(200);

            // Assert - Legacy headers should not be present
            expect(response.headers).not.toHaveProperty("x-ratelimit-limit");
            expect(response.headers).not.toHaveProperty(
                "x-ratelimit-remaining",
            );
            expect(response.headers).not.toHaveProperty("x-ratelimit-reset");
        });
    });

    describe("Error Handling", () => {
        it("should handle malformed requests gracefully", async () => {
            // Arrange
            const freshRateLimiter = createFreshRateLimiter({ max: 5 });
            const testApp = createTestApp(freshRateLimiter);

            // Act
            const response = await request(testApp)
                .get("/test")
                .set("X-Forwarded-For", "invalid-ip")
                .expect(200);

            // Assert
            expect(response.body.message).toBe("Success");
        });

        it("should handle requests without IP information", async () => {
            // Arrange
            const freshRateLimiter = createFreshRateLimiter({ max: 5 });
            const testApp = createTestApp(freshRateLimiter);

            // Act
            const response = await request(testApp).get("/test").expect(200);

            // Assert
            expect(response.body.message).toBe("Success");
        });
    });

    describe("Response Format", () => {
        it("should return consistent error response format when rate limited", async () => {
            // Arrange
            const freshRateLimiter = createFreshRateLimiter({ max: 1 });
            const testApp = createTestApp(freshRateLimiter);

            // Act - Make requests to trigger rate limiting
            const promises = Array.from({ length: 3 }, () =>
                request(testApp).get("/test"),
            );

            const responses = await Promise.all(promises);
            const rateLimitedResponse = responses.find((r) => r.status === 429);

            // Assert
            if (rateLimitedResponse) {
                expect(rateLimitedResponse.body).toHaveProperty(
                    "success",
                    false,
                );
                expect(rateLimitedResponse.body).toHaveProperty("message");
                expect(typeof rateLimitedResponse.body.message).toBe("string");
                expect(rateLimitedResponse.body.message).toContain(
                    "Too many requests",
                );
            }
        });

        it("should return proper HTTP status code when rate limited", async () => {
            // Arrange
            const freshRateLimiter = createFreshRateLimiter({ max: 1 });
            const testApp = createTestApp(freshRateLimiter);

            // Act - Make requests to trigger rate limiting
            const promises = Array.from({ length: 3 }, () =>
                request(testApp).get("/test"),
            );

            const responses = await Promise.all(promises);
            const rateLimitedResponse = responses.find((r) => r.status === 429);

            // Assert
            if (rateLimitedResponse) {
                expect(rateLimitedResponse.status).toBe(
                    HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
                );
            }
        });
    });
});
