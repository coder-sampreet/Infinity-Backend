// health.integration.test.ts
import request from "supertest";
import app from "../../src/app.ts";

describe("GET /api/v1/health", () => {
    it("returns 200 and healthy payload", async () => {
        const res = await request(app).get("/api/v1/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                message: "Service is healthy",
                data: expect.objectContaining({
                    uptimeSeconds: expect.any(Number),
                    uptimeFormatted: expect.any(String),
                }),
            }),
        );
    });
});
