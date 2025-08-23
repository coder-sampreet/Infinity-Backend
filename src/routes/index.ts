import express from "express";
import SystemRoutes from "./system.routes.js";
import docsRoutes from "./docs.routes.js";

const router = express.Router();

router.use("/", SystemRoutes);
router.use("/", docsRoutes);

export default router;
