/**
 * @fileoverview Hello Controller - Basic utility endpoints for API testing and health monitoring
 *
 * This controller provides simple utility functions for testing API connectivity,
 * health monitoring, and basic functionality verification. These endpoints are
 * essential for development, testing, and production monitoring.
 *
 * @author HackTheNorth2025 Team
 * @version 1.0.0
 */

import { Request, Response } from "express";

/**
 * Basic "Hello World" endpoint for API connectivity testing
 *
 * This function provides a simple endpoint to verify that the API is running
 * and responding correctly. It's useful for basic connectivity tests and
 * initial API setup verification.
 *
 * @function hello
 * @param {Request} req - Express request object (unused)
 * @param {Response} res - Express response object
 * @returns {void} JSON response with greeting message and timestamp
 *
 * @example
 * // GET /api/hello/
 * // Response:
 * {
 *   "message": "Hello World!",
 *   "timestamp": "2025-09-13T10:30:00.000Z",
 *   "success": true
 * }
 */
export const hello = (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello World!",
    timestamp: new Date().toISOString(),
    success: true,
  });
};

/**
 * Personalized greeting endpoint with name parameter
 *
 * This function creates personalized greetings using the provided name parameter.
 * It demonstrates parameter handling and dynamic response generation while
 * providing input validation.
 *
 * @function helloName
 * @param {Request} req - Express request object with name parameter
 * @param {Response} res - Express response object
 * @returns {void} JSON response with personalized greeting or error
 *
 * @example
 * // GET /api/hello/John
 * // Response:
 * {
 *   "message": "Hello, John!",
 *   "timestamp": "2025-09-13T10:30:00.000Z",
 *   "success": true
 * }
 *
 * @example
 * // Error case (missing name)
 * {
 *   "message": "Name parameter is required",
 *   "success": false
 * }
 */
export const helloName = (req: Request, res: Response) => {
  const { name } = req.params;

  // Validate name parameter
  if (!name) {
    return res.status(400).json({
      message: "Name parameter is required",
      success: false,
    });
  }

  res.status(200).json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    success: true,
  });
};

/**
 * Health check endpoint for API status monitoring
 *
 * This function provides a health check endpoint that can be used by
 * load balancers, monitoring systems, and deployment pipelines to verify
 * that the API is operational and healthy.
 *
 * @function health
 * @param {Request} req - Express request object (unused)
 * @param {Response} res - Express response object
 * @returns {void} JSON response with health status information
 *
 * @example
 * // GET /api/hello/health
 * // Response:
 * {
 *   "status": "healthy",
 *   "message": "API is running successfully",
 *   "timestamp": "2025-09-13T10:30:00.000Z",
 *   "success": true
 * }
 */
export const health = (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    message: "API is running successfully",
    timestamp: new Date().toISOString(),
    success: true,
  });
};
