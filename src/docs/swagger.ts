// src/docs/swagger.ts
import swaggerJSDoc, { type Options } from "swagger-jsdoc";
import env from "../config/env.config.js";

const apiBase = "/api/v1"; // where you mount your REST routes

const options: Options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Infinity Backend API",
            version: process.env.npm_package_version || "1.0.0",
            description:
                "API documentation for Infinity Backend. Responses are standardized via APIResponse and APIError.",
        },
        servers: [
            {
                url: `http://localhost:${env.PORT || 3000}${apiBase}`,
                description: "Local",
            },
            // Add your prod server here (e.g., { url: "https://api.example.com/api/v1", description: "Production" })
        ],
        // OpenAPI 3.1 uses JSON Schema vocab
        jsonSchemaDialect: "https://json-schema.org/draft/2020-12/schema",
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                // Matches APIResponse<T>
                ApiSuccess: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", const: true },
                        message: {
                            type: "string",
                            examples: ["Operation successful"],
                        },
                        data: {}, // T (any JSON) or null; keep open-ended
                    },
                    required: ["success", "message"],
                    additionalProperties: false,
                },
                // Matches APIError.toResponse()
                ApiError: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", const: false },
                        message: { type: "string", examples: ["Not Found"] },
                        errorCode: { type: "string", examples: ["NOT_FOUND"] },
                        details: { nullable: true },
                    },
                    required: ["success", "message", "errorCode"],
                    additionalProperties: true,
                },
                HealthData: {
                    type: "object",
                    properties: {
                        uptimeSeconds: { type: "number", examples: [123.45] },
                        uptimeFormatted: {
                            type: "string",
                            examples: ["2m 3s"],
                        },
                    },
                    required: ["uptimeSeconds", "uptimeFormatted"],
                    additionalProperties: false,
                },
                InfoData: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            examples: ["infinity-backend"],
                        },
                        version: { type: "string", examples: ["1.0.0"] },
                        env: { type: "string", examples: ["development"] },
                    },
                    required: ["name", "version", "env"],
                    additionalProperties: false,
                },
            },
        },
    },
    // Point this to files that contain @openapi JSDoc blocks
    apis: ["src/routes/**/*.ts", "src/controllers/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
