process.env.NODE_ENV = "test";
process.env.PORT = "3000";
process.env.LOG_LEVEL = "silent";

process.env.ACCESS_TOKEN_SECRET =
    "941f5665e2b426a23e7b3fa453f5b0ef27531667253e0efb8ffcf1366adc26b12cf219f6973e590a766575e636cacec1cb4d3411dc4f9574c636f08edeb5faf9";
process.env.REFRESH_TOKEN_SECRET =
    "bd8035db1489e4effe05474c8a94617422ece860c60021fc5fe95931559320d30375e7a0f448401ae2dfb8294c0e4ea1762b0f344967cfdc3310f310a9f034b3";

process.env.ACCESS_TOKEN_EXPIRY = "60m";
process.env.REFRESH_TOKEN_EXPIRY = "7d";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
process.env.DB_NAME = "infinity_test";
process.env.CORS_ORIGIN = "http://localhost:3000";
