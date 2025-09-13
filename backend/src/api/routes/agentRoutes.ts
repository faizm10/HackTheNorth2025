/**
 * @fileoverview Agent Routes - Handles AI tutor agent interactions and responses
 *
 * This module defines the routing endpoints for the AI tutoring agent system.
 * It provides endpoints for generating conversational responses and initial
 * lesson content based on learning requirements.
 *
 * @author HackTheNorth2025 Team
 * @version 1.0.0
 */

import { Router } from "express";
import {
  getInitialResponse,
  getResponse,
} from "../controllers/agentController.js";

/**
 * Express router instance for agent-related routes
 * @type {Router}
 */
const router = Router();

/**
 * POST /api/agent/response
 *
 * Generates a conversational response from the AI tutor agent based on the
 * provided message history. This endpoint handles ongoing conversations
 * between the student and the AI tutor.
 *
 * @route POST /response
 * @group Agent - AI Tutor Agent operations
 * @param {Object} req.body - Request body
 * @param {Array<ChatMessage>} req.body.messages - Array of conversation messages
 * @param {string} [req.body.model] - Optional model specification (defaults to DEFAULT_MODEL)
 * @returns {Object} 200 - Success response with generated message
 * @returns {Object} 400 - Validation error for invalid request format
 * @returns {Object} 500 - Internal server error
 *
 * @example
 * // Request body
 * {
 *   "messages": [
 *     { "role": "user", "content": "Can you explain addition?" },
 *     { "role": "assistant", "content": "Sure! Addition is..." }
 *   ],
 *   "model": "gpt-4" // optional
 * }
 *
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "message": {
 *     "role": "assistant",
 *     "content": "Let me explain addition in more detail...",
 *     "tool": { // optional tool usage
 *       "type": "quiz",
 *       "data": { "question": "...", "options": [...] }
 *     }
 *   }
 * }
 */
router.post("/response", getResponse);

/**
 * POST /api/agent/initial-response
 *
 * Generates an initial educational lesson and response for a new learning module.
 * This endpoint is called when starting a new learning requirement or module,
 * providing structured educational content to begin the tutoring session.
 *
 * @route POST /initial-response
 * @group Agent - AI Tutor Agent operations
 * @param {Object} req.body - Request body
 * @param {Array<ChatMessage>} [req.body.messages] - Optional existing message history
 * @returns {Object} 200 - Success response with initial lesson content
 * @returns {Object} 500 - Internal server error
 *
 * @example
 * // Request body (messages are optional)
 * {
 *   "messages": [] // optional conversation history
 * }
 *
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "message": {
 *     "role": "assistant",
 *     "content": "Welcome to Module 1! Today we'll learn about addition...",
 *     "tool": { // may include initial assessment tools
 *       "type": "quiz",
 *       "data": { ... }
 *     }
 *   }
 * }
 */
router.post("/initial-response", getInitialResponse);

export default router;
