import express from "express";
import SystemRoutes from "./system.routes.js";

const router = express.Router();

router.use("/", SystemRoutes);

export default router;
