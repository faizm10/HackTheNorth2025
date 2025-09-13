/**
 * @fileoverview Grading Routes - Handles student submission evaluation and assessment
 *
 * This module defines the routing endpoints for the grading system within the
 * AI tutoring platform. It provides endpoints for evaluating student answers,
 * quiz submissions, and overall learning progress assessment.
 *
 * @author HackTheNorth2025 Team
 * @version 1.0.0
 */

import { Router } from "express";
import { gradeSubmission } from "../controllers/agentController.js";

/**
 * Express router instance for grading-related routes
 * @type {Router}
 */
const router = Router();

/**
 * POST /api/grading/grade
 *
 * Evaluates a student's answer to a question and provides detailed feedback.
 * This endpoint uses AI-powered grading to assess correctness, understanding,
 * and provides constructive feedback to help students learn.
 *
 * The grading system evaluates answers based on:
 * - Factual correctness
 * - Conceptual understanding
 * - Completeness and reasoning
 * - Identification of misconceptions
 *
 * @route POST /grade
 * @group Grading - Student assessment operations
 * @param {Object} req.body - Request body containing question and answer
 * @param {string} req.body.question - The question that was asked
 * @param {string} req.body.answer - The student's submitted answer
 * @param {Array<ChatMessage>} [req.body.messages] - Optional conversation context
 * @returns {Object} 200 - Success response with grading results and AI feedback
 * @returns {Object} 400 - Validation error for missing required fields
 * @returns {Object} 500 - Internal server error during grading process
 *
 * @example
 * // Request body
 * {
 *   "question": "What is 2 + 2?",
 *   "answer": "4",
 *   "messages": [ // optional context
 *     { "role": "assistant", "content": "Let's practice addition..." },
 *     { "role": "user", "content": "I think I understand now" }
 *   ]
 * }
 *
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "grading": {
 *     "passed": true,
 *     "feedback": "Excellent! You correctly identified that 2 + 2 = 4. This shows you understand basic addition."
 *   },
 *   "response": {
 *     "role": "assistant",
 *     "content": "Great job! Since you've mastered this concept, let's move on to...",
 *     "tool": { // optional next steps or tools
 *       "type": "grading",
 *       "data": { "passed": true }
 *     }
 *   }
 * }
 *
 * @example
 * // Failed grading response
 * {
 *   "success": true,
 *   "grading": {
 *     "passed": false,
 *     "feedback": "Not quite right. You said 5, but 2 + 2 = 4. Remember that addition means combining quantities..."
 *   },
 *   "response": {
 *     "role": "assistant",
 *     "content": "Let's work through this together. Addition means...",
 *     "tool": {
 *       "type": "grading",
 *       "data": { "passed": false }
 *     }
 *   }
 * }
 */
router.post("/grade", gradeSubmission);

export default router;
