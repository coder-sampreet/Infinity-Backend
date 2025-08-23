import env, { isDev } from "./config/env.config.js";
import connectDB from "./config/db.config.js";
import logger from "./config/logger.config.js";
import app from "./app.js";

const PORT: number = env.PORT;
logger.info(`✅ Environment: ${env.NODE_ENV}`);

const startServer = async (): Promise<void> => {
    try {
        const connectionInstance = await connectDB();
        logger.info(
            `MongoDB connected at: ${connectionInstance.connection.host}`,
        );

        app.listen(PORT, () => {
            if (isDev) {
                logger.info(`Server is running at http://localhost:${PORT}`);
            } else {
                logger.info(`Server is running at PORT: ${PORT}`);
            }
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error("Failed to start server err: ", err.message);
        } else {
            logger.error("Failed to start server");
        }
        process.exit(1);
    }
};

/** Unhandled promise rejections */
process.on("unhandledRejection", (err: unknown) => {
    if (err instanceof Error) {
        logger.error("Unhandled Promise Rejection:", err);
    } else {
        logger.error("Unhandled Promise Rejection:", { err });
    }
    process.exit(1);
});

/** Uncaught exceptions */
process.on("uncaughtException", (err: Error) => {
    logger.error("Uncaught Exception - shutting down:", err);
    process.exit(1);
});

startServer().catch((err) => {
    logger.error("Error while starting the server:", err);
    process.exit(1);
});
