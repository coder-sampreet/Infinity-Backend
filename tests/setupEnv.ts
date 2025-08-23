
process.env.NODE_ENV = "test";

// Required by your Zod schema:
process.env.ACCESS_TOKEN_SECRET = "test_access_secret";
process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
process.env.DB_NAME = "infinity_test";
process.env.CORS_ORIGIN = "http://localhost:3000";

// Optionals/defaults:
process.env.PORT = "3000";
process.env.LOG_LEVEL = "silent";
process.env.ACCESS_TOKEN_EXPIRY = "60m";
process.env.REFRESH_TOKEN_EXPIRY = "7d";
