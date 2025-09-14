/**
 * @fileoverview Grading Controller - AI-powered assessment and evaluation system
 *
 * This controller handles the evaluation of student responses using AI-powered
 * grading mechanisms. It provides detailed feedback, assesses understanding,
 * and determines whether students have met learning requirements.
 *
 * @author HackTheNorth2025 Team
 * @version 1.0.0
 */

import { ChatCompletionMessageParam } from "openai/resources";
import { getLLMCompletion } from "./llmAPI";
import { GradingResponse } from "../../types.js";

/**
 * Evaluates a student's answer to a specific question using AI grading
 *
 * This function uses advanced AI models to assess student responses based on
 * factual correctness, conceptual understanding, completeness, and reasoning.
 * It provides detailed feedback to help students learn from their mistakes.
 *
 * @async
 * @function answerGrading
 * @param {string} question - The question that was asked
 * @param {string} answer - The student's submitted answer
 * @returns {Promise<GradingResponse>} Grading result with pass/fail and feedback
 *
 * @throws {Error} When LLM grading fails or returns invalid format
 *
 * @example
 * const result = await answerGrading("What is 2+2?", "4");
 * // Returns: { passed: true, feedback: "Correct! You understand basic addition." }
 *
 * @example
 * const result = await answerGrading("What is 2+2?", "5");
 * // Returns: { passed: false, feedback: "Not quite right. 2+2 equals 4, not 5..." }
 */
export const answerGrading = async (
  question: string,
  answer: string
): Promise<GradingResponse> => {
  const promptMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a grading agent that evaluates whether a user answered a question correctly.

Your task is to analyze the question and the user's answer to determine if they answered correctly.

Respond ONLY in the following JSON format:
{
  "passed": true/false,
  "feedback": "Detailed feedback explaining why the answer is correct or incorrect, including what they got right or wrong"
}

Consider the following criteria:
- Is the answer factually correct?
- Does it demonstrate understanding of the concept?
- Is it complete and well-reasoned?
- Are there any misconceptions or errors?

Be fair but thorough in your assessment.`,
    },
    {
      role: "user",
      content: `Question: ${question}

User's Answer: ${answer}`,
    },
  ];

  try {
    const completion = await getLLMCompletion(promptMessages);
    const responseText = completion.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("Failed to get grading response from LLM");
    }

    // Parse the JSON response
    const gradingResult = JSON.parse(responseText.trim());

    // Validate the response structure
    if (
      typeof gradingResult.passed !== "boolean" ||
      typeof gradingResult.feedback !== "string"
    ) {
      throw new Error("Invalid grading response format");
    }

    return gradingResult as GradingResponse;
  } catch (error) {
    console.error("Error in answerGrading:", error);
    return {
      passed: false,
      feedback: "Unable to evaluate the answer at this time. Please try again.",
    };
  }
};

/**
 * Evaluates whether a student has demonstrated sufficient understanding of a learning requirement
 *
 * This function analyzes the entire conversation history to determine if a student
 * has sufficiently mastered a specific learning requirement. It considers conceptual
 * understanding, application ability, critical thinking, and depth of knowledge.
 *
 * @async
 * @function gradeRequirementUnderstanding
 * @param {ChatCompletionMessageParam[]} messageHistory - Complete conversation history
 * @param {string} currentRequirement - The learning requirement being evaluated
 * @returns {Promise<GradingResponse>} Assessment of requirement mastery
 *
 * @throws {Error} When LLM evaluation fails or returns invalid format
 *
 * @example
 * const result = await gradeRequirementUnderstanding(
 *   [...conversationHistory],
 *   "Understanding basic addition"
 * );
 * // Returns: { passed: true, feedback: "Student demonstrates solid understanding..." }
 */
export const gradeRequirementUnderstanding = async (
  messageHistory: ChatCompletionMessageParam[],
  currentRequirement: string
): Promise<GradingResponse> => {
  const promptMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a grading agent that evaluates whether a user has demonstrated sufficient understanding of a specific requirement based on their conversation history.

Your task is to analyze the message history and determine if the user has proven they understand the current requirement.

Current Requirement: "${currentRequirement}"

Respond ONLY in the following JSON format:
{
  "passed": true/false,
  "feedback": "Detailed feedback explaining why they passed or failed, including specific areas of strength or weakness. Do not include another lesson. Only include specific feedback about their understanding."
}

Consider the following criteria:
- Does the user demonstrate conceptual understanding?
- Can they apply the knowledge in different contexts?
- Do they show critical thinking about the topic?
- Are there any misconceptions or gaps in understanding?
- Is their understanding deep enough to move to the next requirement?

Be thorough but fair in your assessment.`,
    },
    {
      role: "user",
      content: `Please evaluate the user's understanding based on this conversation history:

${JSON.stringify(
  messageHistory.filter((msg) => msg.role !== "system"),
  null,
  2
)}`,
    },
  ];

  try {
    const completion = await getLLMCompletion(
      promptMessages,
      "command-a-reasoning-08-2025"
    );
    const responseText = completion.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("Failed to get grading response from LLM");
    }

    // Parse the JSON response
    const gradingResult = JSON.parse(responseText.trim());

    // Validate the response structure
    if (
      typeof gradingResult.passed !== "boolean" ||
      typeof gradingResult.feedback !== "string"
    ) {
      throw new Error("Invalid grading response format");
    }

    return gradingResult as GradingResponse;
  } catch (error) {
    console.error("Error in gradeRequirementUnderstanding:", error);
    return {
      passed: false,
      feedback:
        "Unable to evaluate understanding at this time. Please try again.",
    };
  }
};
