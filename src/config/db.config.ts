// db.config.ts
import mongoose, { type Mongoose } from "mongoose";
import env from "./env.config.js";
import logger from "./logger.config.js";

/**
 * Establish a connection to MongoDB using Mongoose.
 *
 * @returns {Promise<Mongoose>} - The active Mongoose connection instance.
 * @throws {Error} - Rethrows any error that occurs during the connection attempt.
 */
const connectDB = async (): Promise<Mongoose> => {
    try {
        // Attempt to connect to MongoDB using the URI and DB name from environment variables
        const connectionInstance = await mongoose.connect(
            `${env.MONGODB_URI}/${env.DB_NAME}`,
        );

        // Return the established connection instance so it can be used elsewhere if needed
        return connectionInstance;
    } catch (err) {
        // If the error is a standard Error object, log its message
        if (err instanceof Error) {
            logger.error(`MongoDB connection failed! Error:${err.message}`);
        } else {
            // Fallback: log a stringified version of the error for non-standard cases
            logger.error(
                `MongoDB connection failed! Unknown Error:${JSON.stringify(err)}`,
            );
        }
        // Re-throw the error so the calling code can handle it (e.g., exit process)
        throw err;
    }
};

export default connectDB;
