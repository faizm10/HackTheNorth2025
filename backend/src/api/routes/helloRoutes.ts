/**
 * @fileoverview Hello Routes - Basic API endpoints for testing and health monitoring
 *
 * This module provides simple utility endpoints for API health checks, basic
 * connectivity testing, and greeting functionality. These routes are primarily
 * used for development, testing, and monitoring the API's availability.
 *
 * @author HackTheNorth2025 Team
 * @version 1.0.0
 */

import { Router } from "express";
import { hello, health, helloName } from "../controllers/helloController.js";

/**
 * Express router instance for basic utility routes
 * @type {Router}
 */
const router = Router();

/**
 * GET /api/hello/
 *
 * Basic "Hello World" endpoint for testing API connectivity and basic functionality.
 * This endpoint provides a simple way to verify that the API is running and
 * responding to requests correctly.
 *
 * @route GET /
 * @group Hello - Basic utility operations
 * @returns {Object} 200 - Success response with greeting message and timestamp
 *
 * @example
 * // Success response
 * {
 *   "message": "Hello World!",
 *   "timestamp": "2025-09-13T10:30:00.000Z",
 *   "success": true
 * }
 */
router.get("/", hello);

/**
 * GET /api/hello/health
 *
 * Health check endpoint for monitoring API status and availability.
 * This endpoint is typically used by load balancers, monitoring systems,
 * and deployment pipelines to verify that the API is healthy and operational.
 *
 * @route GET /health
 * @group Hello - Basic utility operations
 * @returns {Object} 200 - Health status response with operational details
 *
 * @example
 * // Success response
 * {
 *   "status": "healthy",
 *   "message": "API is running successfully",
 *   "timestamp": "2025-09-13T10:30:00.000Z",
 *   "success": true
 * }
 */
router.get("/health", health);

/**
 * GET /api/hello/:name
 *
 * Personalized greeting endpoint that returns a custom message with the
 * provided name parameter. This endpoint demonstrates parameter handling
 * and dynamic response generation.
 *
 * @route GET /:name
 * @group Hello - Basic utility operations
 * @param {string} name - The name to include in the greeting (URL parameter)
 * @returns {Object} 200 - Personalized greeting response
 * @returns {Object} 400 - Validation error when name parameter is missing
 *
 * @example
 * // Request: GET /api/hello/John
 * // Success response
 * {
 *   "message": "Hello, John!",
 *   "timestamp": "2025-09-13T10:30:00.000Z",
 *   "success": true
 * }
 *
 * @example
 * // Error response (missing name)
 * {
 *   "message": "Name parameter is required",
 *   "success": false
 * }
 */
router.get("/:name", helloName);

export default router;
