import request from "supertest";
import app from "../../src/app.js";
import env from "../../src/config/env.config.js";

describe("Health Endpoint Integration", () => {
    beforeAll(() => {
        // Ensure we're using test environment
        expect(process.env.NODE_ENV).toBe("test");
    });

    describe("GET /api/v1/health", () => {
        it("should return 200 OK with health information", async () => {
            // Act
            const response = await request(app)
                .get("/api/v1/health")
                .expect(200);

            // Assert
            expect(response.body).toMatchObject({
                success: true,
                message: "Service is healthy",
                data: {
                    uptimeSeconds: expect.any(Number),
                    uptimeFormatted: expect.stringMatching(/^\d+m \d+s$/),
                },
            });
        });

        it("should return valid uptime data", async () => {
            // Act
            const response = await request(app)
                .get("/api/v1/health")
                .expect(200);

            // Assert
            const { uptimeSeconds, uptimeFormatted } = response.body.data;

            // Uptime should be a positive number
            expect(uptimeSeconds).toBeGreaterThan(0);
            expect(typeof uptimeSeconds).toBe("number");

            // Formatted uptime should match pattern "Xm Ys"
            expect(uptimeFormatted).toMatch(/^\d+m \d+s$/);

            // Verify the formatted string matches the seconds
            const [minutes, seconds] = uptimeFormatted.split(" ");
            const expectedMinutes = Math.floor(uptimeSeconds / 60);
            const expectedSeconds = Math.floor(uptimeSeconds % 60);

            expect(parseInt(minutes)).toBe(expectedMinutes);
            expect(parseInt(seconds)).toBe(expectedSeconds);
        });

        it("should have correct response structure", async () => {
            // Act
            const response = await request(app)
                .get("/api/v1/health")
                .expect(200);

            // Assert
            expect(response.body).toHaveProperty("success");
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("data");

            expect(response.body.success).toBe(true);
            expect(typeof response.body.message).toBe("string");
            expect(typeof response.body.data).toBe("object");
        });

        it("should return consistent response format", async () => {
            // Act - Make multiple requests
            const response1 = await request(app)
                .get("/api/v1/health")
                .expect(200);

            const response2 = await request(app)
                .get("/api/v1/health")
                .expect(200);

            // Assert - Structure should be consistent
            expect(response1.body).toHaveProperty("success", true);
            expect(response2.body).toHaveProperty("success", true);
            expect(response1.body).toHaveProperty(
                "message",
                "Service is healthy",
            );
            expect(response2.body).toHaveProperty(
                "message",
                "Service is healthy",
            );

            // Uptime should increase between requests
            expect(response2.body.data.uptimeSeconds).toBeGreaterThanOrEqual(
                response1.body.data.uptimeSeconds,
            );
        });

        it("should handle concurrent requests", async () => {
            // Act - Make concurrent requests
            const promises = Array.from({ length: 5 }, () =>
                request(app).get("/api/v1/health").expect(200),
            );

            const responses = await Promise.all(promises);

            // Assert - All should succeed
            responses.forEach((response) => {
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe("Service is healthy");
                expect(response.body.data).toHaveProperty("uptimeSeconds");
                expect(response.body.data).toHaveProperty("uptimeFormatted");
            });
        });
    });

    describe("GET /api/v1/info", () => {
        it("should return 200 OK with service information", async () => {
            // Act
            const response = await request(app).get("/api/v1/info").expect(200);

            // Assert
            expect(response.body).toMatchObject({
                success: true,
                data: {
                    name: "infinity-backend",
                    version: expect.any(String),
                    env: env.NODE_ENV,
                },
            });
        });

        it("should return correct environment information", async () => {
            // Act
            const response = await request(app).get("/api/v1/info").expect(200);

            // Assert
            expect(response.body.data.env).toBe("test");
            expect(response.body.data.name).toBe("infinity-backend");
            expect(typeof response.body.data.version).toBe("string");
        });

        it("should handle missing version gracefully", async () => {
            // Arrange - Temporarily remove version
            const originalVersion = process.env.npm_package_version;
            delete process.env.npm_package_version;

            // Act
            const response = await request(app).get("/api/v1/info").expect(200);

            // Assert
            expect(response.body.data.version).toBe("unknown");

            // Cleanup
            if (originalVersion) {
                process.env.npm_package_version = originalVersion;
            }
        });
    });

    describe("Error Handling", () => {
        it("should return 404 for non-existent endpoints", async () => {
            // Act
            const response = await request(app)
                .get("/api/v1/non-existent")
                .expect(404);

            // Assert
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toContain("not found");
        });

        it("should return 404 for root path", async () => {
            // Act
            const response = await request(app).get("/").expect(404);

            // Assert
            expect(response.body).toHaveProperty("success", false);
        });

        it("should handle invalid HTTP methods", async () => {
            // Act
            const response = await request(app)
                .post("/api/v1/health")
                .expect(404);

            // Assert
            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("API Response Format", () => {
        it("should use consistent API response structure", async () => {
            // Act
            const healthResponse = await request(app)
                .get("/api/v1/health")
                .expect(200);

            const infoResponse = await request(app)
                .get("/api/v1/info")
                .expect(200);

            // Assert - Both endpoints should use the same response structure
            expect(healthResponse.body).toHaveProperty("success");
            expect(healthResponse.body).toHaveProperty("message");
            expect(healthResponse.body).toHaveProperty("data");

            expect(infoResponse.body).toHaveProperty("success");
            expect(infoResponse.body).toHaveProperty("message");
            expect(infoResponse.body).toHaveProperty("data");
        });

        it("should return proper HTTP headers", async () => {
            // Act
            const response = await request(app)
                .get("/api/v1/health")
                .expect(200);

            // Assert
            expect(response.headers["content-type"]).toContain(
                "application/json",
            );
        });
    });
});
