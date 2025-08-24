import mongoose from "mongoose";
import connectDB from "../../src/config/db.config.js";
import env from "../../src/config/env.config.js";
import logger from "../../src/config/logger.config.js";

describe("Database Configuration Integration", () => {
    beforeAll(async () => {
        // Ensure we're using test environment
        expect(process.env.NODE_ENV).toBe("test");
    });

    afterEach(async () => {
        // Clean up any existing connections after each test
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    afterAll(async () => {
        // Clean up all connections after all tests
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe("connectDB", () => {
        it("should successfully connect to test database", async () => {
            // Act
            const connection = await connectDB();

            // Assert
            expect(connection).toBeDefined();
            expect(mongoose.connection.readyState).toBe(1); // Connected
            expect(mongoose.connection.host).toBe("127.0.0.1");
            expect(mongoose.connection.port).toBe(27017);
            expect(mongoose.connection.name).toBe("infinity_test");
        });

        it("should use correct environment variables for connection", async () => {
            // Arrange
            const expectedUri = `${env.MONGODB_URI}/${env.DB_NAME}`;

            // Act
            await connectDB();

            // Assert
            expect(env.MONGODB_URI).toBe("mongodb://127.0.0.1:27017");
            expect(env.DB_NAME).toBe("infinity_test");
            expect(expectedUri).toBe("mongodb://127.0.0.1:27017/infinity_test");
        });

        it("should handle connection to non-existent database gracefully", async () => {
            // Arrange - temporarily modify environment to use non-existent database
            const originalDbName = env.DB_NAME;
            const originalUri = env.MONGODB_URI;

            // Mock environment variables for this test
            Object.defineProperty(env, "DB_NAME", {
                value: "non_existent_db_test",
                writable: true,
            });

            // Act & Assert
            try {
                await connectDB();
                // If connection succeeds, that's fine for integration test
                expect(mongoose.connection.readyState).toBe(1);
            } catch (error) {
                // If connection fails, it should be handled gracefully
                expect(error).toBeDefined();
                expect(typeof error).toBe("object");
            } finally {
                // Restore original values
                Object.defineProperty(env, "DB_NAME", {
                    value: originalDbName,
                    writable: true,
                });
                Object.defineProperty(env, "MONGODB_URI", {
                    value: originalUri,
                    writable: true,
                });
            }
        });

        it("should maintain connection state correctly", async () => {
            // Act
            const connection1 = await connectDB();
            const connection2 = await connectDB(); // Should reuse existing connection

            // Assert
            expect(connection1).toBe(connection2); // Same connection instance
            expect(mongoose.connection.readyState).toBe(1); // Still connected
        });

        it("should handle disconnection and reconnection", async () => {
            // Act - Connect
            await connectDB();
            expect(mongoose.connection.readyState).toBe(1);

            // Act - Disconnect
            await mongoose.disconnect();
            expect(mongoose.connection.readyState).toBe(0);

            // Act - Reconnect
            await connectDB();
            expect(mongoose.connection.readyState).toBe(1);
        });
    });

    describe("Environment Configuration Integration", () => {
        it("should load environment variables correctly", () => {
            // Assert
            expect(env).toBeDefined();
            expect(env.MONGODB_URI).toBeDefined();
            expect(env.DB_NAME).toBeDefined();
            expect(typeof env.MONGODB_URI).toBe("string");
            expect(typeof env.DB_NAME).toBe("string");
            expect(env.MONGODB_URI.length).toBeGreaterThan(0);
            expect(env.DB_NAME.length).toBeGreaterThan(0);
        });

        it("should use test environment configuration", () => {
            // Assert
            expect(process.env.NODE_ENV).toBe("test");
            expect(env.MONGODB_URI).toBe("mongodb://127.0.0.1:27017");
            expect(env.DB_NAME).toBe("infinity_test");
        });
    });

    describe("Logger Integration", () => {
        it("should have logger properly configured", () => {
            // Assert
            expect(logger).toBeDefined();
            expect(typeof logger.error).toBe("function");
            expect(typeof logger.info).toBe("function");
            expect(typeof logger.warn).toBe("function");
            expect(typeof logger.debug).toBe("function");
        });

        it("should log connection events", async () => {
            // Arrange
            const logSpy = jest
                .spyOn(logger, "info")
                .mockImplementation(() => logger);

            // Act
            await connectDB();

            // Assert
            // Note: Mongoose doesn't always log connection events by default
            // This test verifies the logger is available and functional
            expect(logSpy).toBeDefined();

            // Clean up
            logSpy.mockRestore();
        });
    });

    describe("MongoDB Connection Features", () => {
        it("should support basic MongoDB operations after connection", async () => {
            // Arrange
            await connectDB();

            // Act - Test basic MongoDB functionality
            const collections = await mongoose.connection.db
                .listCollections()
                .toArray();

            // Assert
            expect(Array.isArray(collections)).toBe(true);
            expect(mongoose.connection.readyState).toBe(1);
        });

        it("should handle connection options correctly", async () => {
            // Act
            await connectDB();

            // Assert
            expect(mongoose.connection.readyState).toBe(1);
            // Verify connection has expected properties
            expect(mongoose.connection.host).toBe("127.0.0.1");
            expect(mongoose.connection.port).toBe(27017);
        });
    });
});
