/**
 * @fileoverview Agent Controller - Core AI tutoring agent logic and conversation handling
 *
 * This controller manages the AI tutoring agent's conversational capabilities,
 * including response generation, tool usage, quiz generation, and learning
 * progress tracking. It serves as the main interface between the frontend
 * and the underlying AI language models.
 *
 * @author HackTheNorth2025 Team
 * @version 1.0.0
 */

import {
  getLLMCompletion,
  chatCompletionsCreate,
  DEFAULT_MODEL,
} from "./llmAPI.js";
import { Request, Response } from "express";
import { ChatCompletionMessageParam } from "openai/resources";
import {
  answerGrading,
  gradeRequirementUnderstanding,
} from "./gradingController.js";
import { CurrentQuestion } from "../../types.js";

/**
 * Supported chat message roles in the conversation system
 * @typedef {"system" | "user" | "assistant"} ChatRole
 */
type ChatRole = "system" | "user" | "assistant";

/**
 * Structure for individual chat messages in conversations
 * @typedef {Object} ChatMessage
 * @property {ChatRole} role - The role of the message sender
 * @property {string} content - The actual message content
 */
type ChatMessage = { role: ChatRole; content: string };

/**
 * Default AI model used for generating responses
 * @constant {string}
 */
const MODEL = DEFAULT_MODEL;

/**
 * Global context state for the tutoring session
 * Tracks the current learning progress, requirements, and active questions
 * @type {Object}
 * @property {string} currentRequirement - The learning requirement currently being taught
 * @property {string[]} completedRequirements - Array of requirements the student has mastered
 * @property {string} currentModule - The current learning module identifier
 * @property {CurrentQuestion|null} currentQuestion - Currently active question/quiz if any
 */
const context = {
  currentRequirement: "The user must understand the concept of addition",
  completedRequirements: ["something"],
  currentModule: "Module 1",
  currentQuestion: null as CurrentQuestion | null,
};

/**
 * Available AI tools that the tutoring agent can use during conversations
 * These tools extend the agent's capabilities beyond simple text responses
 * @constant {Array<Object>}
 */
const TOOLS: any[] = [
  {
    type: "function",
    function: {
      name: "generateQuiz",
      description:
        "Best used when a multiple choice question suffices to evaulate the user's understanding",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generateShortAnswer",
      description: "Best used when generating a short answer assessment",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gradeRequirementUnderstanding",
      description:
        "Evaluate the users understanding of the current Requirement. EXPENSIVE. only use if you are sure that it is time to evaluate.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

/**
 * Handles ongoing conversation responses from the AI tutoring agent
 *
 * This function processes conversation messages and generates appropriate
 * responses using the configured AI model. It validates input, manages
 * conversation context, and can trigger tool usage for enhanced interactions.
 *
 * @async
 * @function getResponse
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with generated message or error
 *
 * @throws {400} When messages array is invalid or empty
 * @throws {400} When message format is incorrect (missing role/content)
 * @throws {500} When LLM API fails or internal server error occurs
 *
 * @example
 * // Request body structure
 * {
 *   messages: [
 *     { role: "user", content: "Can you help me with math?" },
 *     { role: "assistant", content: "Of course! What would you like to learn?" }
 *   ],
 *   model: "gpt-4" // optional
 * }
 */
export const getResponse = async (req: Request, res: Response) => {
  try {
    const {
      messages,
      model = MODEL,
      requirements,
      currentRequirementIndex,
      currentModule,
    } = req.body as {
      messages: ChatMessage[];
      model?: string;
      requirements?: Array<string | { description: string }>;
      currentRequirementIndex?: number;
      currentModule?: string;
    };

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error:
          "Invalid request: messages array is required and cannot be empty",
      });
    }

    // Validate individual message structure
    for (const message of messages) {
      if (!message.role || !message.content) {
        return res.status(400).json({
          error:
            "Invalid message format: each message must have 'role' and 'content' properties",
        });
      }
    }

    // Update tutoring context if metadata provided
    if (
      Array.isArray(requirements) &&
      typeof currentRequirementIndex === "number"
    ) {
      const idx = Math.max(
        0,
        Math.min(currentRequirementIndex, requirements.length - 1)
      );
      const req = requirements[idx];
      context.currentRequirement =
        typeof req === "string"
          ? req
          : req?.description || context.currentRequirement;
    }
    if (typeof currentModule === "string" && currentModule.trim()) {
      context.currentModule = currentModule.trim();
    }

    // Generate AI response with potential tool usage
    const generatedMessage = await getLLMResponse(messages, { model });

    res.json({
      success: true,
      message: generatedMessage,
    });
  } catch (error: any) {
    if (error?.status) {
      return res
        .status(error.status)
        .json({ error: error.message || "Cohere API error" });
    }
    res
      .status(500)
      .json({ error: "Internal server error while generating response" });
  }
};

/**
 * Generates the initial lesson response for a new learning module
 *
 * This function creates the opening educational content when a student begins
 * a new learning requirement or module. It sets up the tutoring context and
 * provides foundational instruction tailored to the current requirement.
 *
 * @async
 * @function getInitialResponse
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with initial lesson content
 *
 * @throws {500} When LLM API fails or internal server error occurs
 *
 * @example
 * // Request body (optional)
 * {
 *   messages: [] // optional existing conversation context
 * }
 *
 * @example
 * // Response structure
 * {
 *   success: true,
 *   message: {
 *     role: "assistant",
 *     content: "Welcome! Let's start learning about addition...",
 *     tool: { ... } // optional tool usage for initial assessment
 *   }
 * }
 */
export const getInitialResponse = async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      requirements,
      currentRequirementIndex,
      currentModule,
    } = (req.body || {}) as {
      messages?: ChatMessage[];
      requirements?: Array<string | { description: string }>;
      currentRequirementIndex?: number;
      currentModule?: string;
    };

    // Update tutoring context if metadata provided
    if (
      Array.isArray(requirements) &&
      typeof currentRequirementIndex === "number"
    ) {
      const idx = Math.max(
        0,
        Math.min(currentRequirementIndex, requirements.length - 1)
      );
      const req = requirements[idx];
      context.currentRequirement =
        typeof req === "string"
          ? req
          : req?.description || context.currentRequirement;
    }
    if (typeof currentModule === "string" && currentModule.trim()) {
      context.currentModule = currentModule.trim();
    }

    // Prepare messages with system instruction for initial lesson
    const messagesWithSystem: ChatMessage[] = [
      ...((Array.isArray(messages) && messages.length > 0
        ? messages
        : []) as ChatMessage[]),
    ];

    const generatedMessage = await getLLMResponse(messagesWithSystem, {
      model: MODEL,
    });

    res.json({
      success: true,
      message: generatedMessage,
    });
  } catch (error: any) {
    if (error?.status) {
      return res
        .status(error.status)
        .json({ error: error.message || "Cohere API error" });
    }
    res.status(500).json({
      error: "Internal server error while generating initial response",
    });
  }
};

/**
 * Executes AI tools based on the agent's decision during conversation
 *
 * This function handles the execution of various educational tools that the
 * AI agent can use to enhance the learning experience, including quiz generation,
 * short answer questions, and requirement understanding assessment.
 *
 * @async
 * @function useTool
 * @param {any} toolCalls - Array of tool calls requested by the AI
 * @param {ChatMessage[]} messages - Current conversation context
 * @returns {Promise<Object|null>} Tool execution result with generated LLM response or null if no tools
 *
 * @private
 */
const useTool = async (toolCalls: any, messages: ChatMessage[]) => {
  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  const toolCall = toolCalls[0];
  const functionName = toolCall.function.name as string;

  try {
    let result: any;
    let toolData: any;

    switch (functionName) {
      case "generateQuiz":
        result = await generateQuiz(messages);
        context.currentQuestion = { type: "quiz", data: result };
        toolData = { type: "quiz", data: result };
        break;
      case "generateShortAnswer":
        result = await generateShortAnswer(messages);
        context.currentQuestion = { type: "shortAnswer", data: result };
        toolData = { type: "shortAnswer", data: result };
        break;
      case "gradeRequirementUnderstanding":
        result = await gradeRequirementUnderstanding(
          messages,
          context.currentRequirement
        );
        // Clear current question if grading passes
        if (result.passed) {
          context.currentQuestion = null;
        }
        toolData = { type: "grading", data: result };
        break;
      default:
        throw new Error(`Unknown tool: ${functionName}`);
    }

    return {
      tool: toolData,
    };
  } catch (error: any) {
    return {
      role: "assistant",
      content: JSON.stringify({
        type: "error",
        message: `Failed to execute ${functionName}: ${error.message}`,
      }),
    };
  }
};

/**
 * Generates LLM responses with tool usage capabilities
 *
 * This is the core function that interfaces with the language model to generate
 * educational responses. It handles tool execution, conversation context, and
 * ensures responses are appropriate for the tutoring context.
 *
 * @async
 * @function getLLMResponse
 * @param {ChatMessage[]} messages - Conversation history
 * @param {Record<string, any>} extraContext - Additional context (model, etc.)
 * @returns {Promise<Object>} Generated response with potential tool usage
 *
 * @throws {Error} When LLM fails to generate a response
 */
export const getLLMResponse = async (
  messages: ChatMessage[],
  extraContext: Record<string, any>
) => {
  const model = (extraContext?.model as string) || MODEL;

  try {
    const completion: any = await chatCompletionsCreate({
      model,
      messages,
    });

    const completionWithTools: any = await chatCompletionsCreate({
      model: "command-a-reasoning-08-2025",
      messages: [
        ...messages,
        {
          role: "assistant",
          content:
            "thought: I should use a tool to help assess the user, if the time is right",
        },
        completion.choices?.[0]?.message,
      ],
      tools: TOOLS as any,
      tool_choice: "auto",
    });

    const responseMessage = completionWithTools.choices?.[0]?.message;
    if (!responseMessage) {
      throw new Error("Failed to generate response from Cohere");
    }

    console.log("LLM response with tools", responseMessage);

    let toolResponse: any;

    // Handle tool calls if present
    if ((responseMessage as any).tool_calls) {
      toolResponse = await useTool(
        (responseMessage as any).tool_calls,
        messages
      );
      if (toolResponse) {
        return { ...completion.choices?.[0]?.message, ...toolResponse };
      }
    }

    return { ...completion.choices?.[0]?.message };
  } catch (error) {
    throw error;
  }
};

/**
 * Generates a multiple-choice quiz question based on conversation context
 *
 * This function creates interactive quiz questions to test student understanding
 * of the concepts being discussed. The quiz includes multiple choice options
 * and tracks the correct answer for grading purposes.
 *
 * @async
 * @function generateQuiz
 * @param {ChatCompletionMessageParam[]} messages - Conversation context
 * @returns {Promise<Object>} Quiz object with question, options, and answer
 *
 * @throws {Error} When quiz generation fails or returns invalid JSON
 *
 * @example
 * // Returned quiz structure
 * {
 *   "question": "What is 2 + 3?",
 *   "options": [
 *     { "label": "A", "content": "4" },
 *     { "label": "B", "content": "5" },
 *     { "label": "C", "content": "6" }
 *   ],
 *   "answer": "B"
 * }
 */
export const generateQuiz = async (messages: ChatCompletionMessageParam[]) => {
  const promptMessages = [
    {
      role: "system",
      content:
        'Given the conversation so far, generate a quiz question with multiple choice options. Respond ONLY in the following JSON format: { "options": [ { "label": "A", "content": "Option 1" }, { "label": "B", "content": "Option 2" }, ... ], "answer": "string", "question": "string" }. Do not include any explanation or extra text.',
    } as ChatCompletionMessageParam,
    ...messages.filter((msg) => msg.role !== "system"),
  ];

  const completion: any = await getLLMCompletion(
    promptMessages,
    "command-a-03-2025"
  );

  console.log("quiz completion", completion);
  const generatedMessage = completion.choices?.[0]?.message?.content;
  if (!generatedMessage) {
    throw new Error("Failed to generate quiz from Cohere");
  }
  try {
    const quiz = JSON.parse(generatedMessage.trim());
    return quiz;
  } catch (e) {
    throw new Error("Quiz response was not valid JSON: " + generatedMessage);
  }
};

/**
 * Generates a short answer question based on conversation context
 *
 * This function creates open-ended questions that require students to
 * demonstrate their understanding through written explanations rather
 * than multiple choice selections.
 *
 * @async
 * @function generateShortAnswer
 * @param {ChatCompletionMessageParam[]} messages - Conversation context
 * @returns {Promise<Object>} Short answer question with ideal response
 *
 * @throws {Error} When question generation fails or returns invalid JSON
 *
 * @example
 * // Returned question structure
 * {
 *   "question": "Explain how addition works with examples",
 *   "idealAnswer": "Addition combines two or more numbers to get a sum..."
 * }
 */
export const generateShortAnswer = async (
  messages: ChatCompletionMessageParam[]
) => {
  const promptMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        'Generate a short answer question based on the conversation and the current requirement. Respond ONLY in the following JSON format: { "question": "string", "idealAnswer": "string" }. Do not include any explanation or extra text.',
    } as ChatCompletionMessageParam,
    ...messages.filter((msg) => msg.role !== "system"),
  ];

  const completion: any = await getLLMCompletion(promptMessages);
  const generatedMessage = completion.choices?.[0]?.message?.content;
  if (!generatedMessage) {
    throw new Error("Failed to generate short answer from Cohere");
  }
  try {
    const shortAnswer = JSON.parse(generatedMessage.trim());
    return shortAnswer;
  } catch (e) {
    throw new Error(
      "Short answer response was not valid JSON: " + generatedMessage
    );
  }
};

/**
 * Handles student answer submission and provides AI-powered grading
 *
 * This function processes student answers to questions, evaluates them using
 * AI grading, provides feedback, and generates appropriate follow-up responses
 * from the tutoring agent based on the grading results.
 *
 * @async
 * @function gradeSubmission
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with grading and AI follow-up
 *
 * @throws {400} When question or answer is missing
 * @throws {500} When grading or response generation fails
 *
 * @example
 * // Request body
 * {
 *   "question": "What is 2 + 2?",
 *   "answer": "4",
 *   "messages": [...] // optional conversation context
 * }
 *
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "grading": {
 *     "passed": true,
 *     "feedback": "Correct! You understand addition."
 *   },
 *   "response": {
 *     "role": "assistant",
 *     "content": "Excellent work! Let's move to the next topic..."
 *   }
 * }
 */
export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    const {
      question,
      answer,
      messages = [],
    } = req.body as {
      question: string;
      answer: string;
      messages?: ChatMessage[];
    };

    // Validate required fields
    if (!question || !answer) {
      return res.status(400).json({
        error: "Invalid request: question and answer are required",
      });
    }

    // Call the grading controller to get the grading result
    const gradingResult = await answerGrading(question, answer);

    // Clear current question if grading passed
    if (gradingResult.passed) {
      context.currentQuestion = null;
    }

    // Add the grading result as a system message to the conversation
    const messagesWithGrading: ChatMessage[] = [
      ...messages,
      {
        role: "system",
        content: `Grading Result: ${gradingResult.feedback} This is the feedback from the user's answer. Please take this into account with your teaching.`,
      },
    ];

    // Get the LLM's response based on the grading
    // TODO: Add next requirement or end module
    const llmResponse = await getLLMResponse(messagesWithGrading, {
      model: MODEL,
    });

    res.json({
      success: true,
      grading: gradingResult,
      response: llmResponse,
    });
  } catch (error: any) {
    if (error?.status) {
      return res
        .status(error.status)
        .json({ error: error.message || "Grading API error" });
    }
    res
      .status(500)
      .json({ error: "Internal server error while grading submission" });
  }
};
