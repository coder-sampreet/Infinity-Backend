import env from "../config/env.config.js";
import express from "express";
import type { Request, Response } from "express";
import APIResponse from "../core/APIResponse.js";

const router = express.Router();

/** Health check (liveness probe) */
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness probe
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthData'
 */
router.get("/health", (req: Request, res: Response) => {
    const uptime = process.uptime();
    return APIResponse.ok(
        res,
        {
            uptimeSeconds: uptime,
            uptimeFormatted: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
        },
        "Service is healthy",
    );
});

/** Info (version/build metadata) */
/**
 * @openapi
 * /info:
 *   get:
 *     summary: Service metadata
 *     tags: [System]
 *     responses:
 *       200:
 *         description: App info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InfoData'
 */
router.get("/info", (req: Request, res: Response) => {
    return APIResponse.ok(res, {
        name: "infinity-backend",
        version: process.env.npm_package_version || "unknown",
        env: env.NODE_ENV,
    });
});

export default router;
