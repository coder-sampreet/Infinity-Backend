// docs.routes.ts
import express from "express";
import type { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../docs/swagger.js";

const router = express.Router();

// Raw specss
router.get("/openapi.json", (_req: Request, res: Response) => {
    res.status(200).json(swaggerSpec);
});

// Swagger UI
router.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: "Infinity Backend API Docs",
    }),
);

export default router;
