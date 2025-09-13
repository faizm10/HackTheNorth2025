const OpenAI = require("openai");

// Initialize OpenAI client configured to use Cohere via a compatible wrapper
// Note: Cohere doesn't have a direct OpenAI-compatible API, but we can use their API directly
const openai = new OpenAI({
  apiKey:
    process.env.COHERE_API_KEY || "pJZf7BpJDXl16cgo4iI2adeSJp0B7kzxLHba6m7B",
  baseURL: "https://api.cohere.ai/compatibility/v1", // Cohere's API v2 endpoint
});

const MODEL = "command-a-03-2025";

const context = {
  currentRequirement: "The user must understand the concept of addition",
  completedRequirements: ["something else"],
};

// Define available tools
const TOOLS = [
  {
    type: "function",
    function: {
      name: "generateQuiz",
      description:
        "Generate a quiz question with multiple choice options based on the conversation",
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
      description: "Generate a short answer question based on the conversation",
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
      name: "completeRequirement",
      description:
        "When a user fully understands a requirement, use this tool to complete it and move to the next",
    },
  },
];
/**
 * Get chat completion response from OpenAI
 * POST /api/chat/response
 */
const getResponse = async (req, res) => {
  try {
    console.log("getResponse");
    console.log(req.body);
    const { messages, model = "command-a-03-2025" } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error:
          "Invalid request: messages array is required and cannot be empty",
      });
    }

    // Validate message format
    for (const message of messages) {
      if (!message.role || !message.content) {
        return res.status(400).json({
          error:
            "Invalid message format: each message must have 'role' and 'content' properties",
        });
      }
    }

    const result = await getLLMCompletion([
      ...messages,
      {
        role: "system",
        content:
          "Based on the conversation, return to me only the string 'TEACH' if our next message should be a teaching message, or the string 'ASSESS' if our next message should assess the users knowledge on the current requirement ",
      },
    ]);
    const mode = result.choices[0].message.content;

    // Use getLLMResponse instead of direct OpenAI API call
    const generatedMessage = await getLLMResponse(messages, {
      mode,
    });

    // Return the generated message
    res.json({
      success: true,
      message: generatedMessage,
    });
  } catch (error) {
    console.error("Error generating chat response:", error);

    // Handle specific Cohere API errors (via OpenAI SDK)
    if (error.status) {
      return res.status(error.status).json({
        error: error.message || "Cohere API error",
      });
    }

    // Handle other errors
    res.status(500).json({
      error: "Internal server error while generating response",
    });
  }
};

const getInitialResponse = async (req, res) => {
  console.log("getInitialResponse");
  try {
    const { messages = [] } = req.body;

    const messagesWithSystem = [
      ...(Array.isArray(messages) && messages.length > 0 ? messages : []),
      {
        role: "system",
        content:
          "You are an AI tutor agent. You are teaching the user a new module. teach the current requirement. Teach the user on a fundamental level on the requirement.Use tools available to you to assess the users understanding. Finally, when the user fully understands a requirement, use a complete tool. Begin by generating an educational lesson onCurrent Requirement: " +
          context.currentRequirement,
      },
    ];

    console.log("messages", messagesWithSystem);
    // Use getLLMResponse for initial response
    const generatedMessage = await getLLMCompletion(messagesWithSystem);

    res.json({
      success: true,
      message: generatedMessage,
    });
  } catch (error) {
    console.error("Error generating initial response:", error);

    // Handle specific Cohere API errors (via OpenAI SDK)
    if (error.status) {
      return res.status(error.status).json({
        error: error.message || "Cohere API error",
      });
    }

    // Handle other errors
    res.status(500).json({
      error: "Internal server error while generating initial response",
    });
  }
};

/**
 * Handles tool calls by executing the appropriate function
 * @param {Array} toolCalls - Array of tool calls from OpenAI response
 * @param {Array} messages - Original messages for context
 * @returns {Promise<Object>} - The tool result message or null if no tools called
 */
const useTool = async (toolCalls, messages) => {
  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  // Handle the first tool call (assuming one tool call at a time)
  const toolCall = toolCalls[0];
  const functionName = toolCall.function.name;

  try {
    let result;

    switch (functionName) {
      case "generateQuiz":
        result = await generateQuiz(messages);
        return {
          role: "assistant",
          content: "Here's a short quiz:",
          tool: {
            type: "quiz",
            data: result,
          },
        };
      case "generateShortAnswer":
        result = await generateShortAnswer(messages);
        return {
          role: "assistant",
          content: "Here's a short answer question:",
          tool: {
            type: "shortAnswer",
            data: result,
          },
        };
      default:
        throw new Error(`Unknown tool: ${functionName}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${functionName}:`, error);
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
 * Wraps the OpenAI SDK to return a response message given chat history.
 * @param {Array} messages - The chat history.
 * @returns {Promise} - The generated response message.
 */
const getLLMResponse = async (messages, context) => {
  const model = MODEL;

  try {
    // First call OpenAI with tools to check if any should be used
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        ...messages,
        { role: "system", content: JSON.stringify(context) },
      ],
      tools: TOOLS,
      tool_choice: "auto", // Let the model decide whether to use tools
    });

    const responseMessage = completion.choices[0]?.message;

    if (!responseMessage) {
      throw new Error("Failed to generate response from Cohere");
    }

    // Check if the model wants to use any tools
    if (responseMessage.tool_calls) {
      const toolResponse = await useTool(responseMessage.tool_calls, messages);
      if (toolResponse) {
        return { ...responseMessage, ...toolResponse };
      }
    }

    // If no tools were called, return the generated message
    return responseMessage;
  } catch (error) {
    console.error("Cohere API Error:", error);
    throw error;
  }
};

const getLLMCompletion = async (messages) => {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
  });
  return completion;
};

const generateQuiz = async (messages) => {
  // Generate a quiz-style completion using Cohere via OpenAI SDK
  const promptMessages = [
    ...messages,
    {
      role: "system",
      content:
        'Given the conversation so far, generate a quiz question with multiple choice options. Respond ONLY in the following JSON format: { "options": [ { "label": "A", "content": "Option 1" }, { "label": "B", "content": "Option 2" }, ... ], "answer": "A" }. Do not include any explanation or extra text.',
    },
  ];

  const completion = await getLLMCompletion(promptMessages);

  const generatedMessage = completion.choices[0]?.message?.content;

  if (!generatedMessage) {
    throw new Error("Failed to generate quiz from Cohere");
  }

  // Try to parse the JSON response
  try {
    const quiz = JSON.parse(generatedMessage.trim());
    return quiz;
  } catch (e) {
    throw new Error("Quiz response was not valid JSON: " + generatedMessage);
  }
};

const generateShortAnswer = async (messages) => {
  const promptMessages = [
    ...messages,
    {
      role: "system",
      content:
        'Generate a short answer question based on the conversation and the current requirement. Respond ONLY in the following JSON format: { "question": "string", "idealAnswer": "string" }. Do not include any explanation or extra text.',
    },
  ];

  const completion = await getLLMCompletion(promptMessages);

  const generatedMessage = completion.choices[0]?.message?.content;

  if (!generatedMessage) {
    throw new Error("Failed to generate short answer from Cohere");
  }

  // Try to parse the JSON response
  try {
    const shortAnswer = JSON.parse(generatedMessage.trim());
    return shortAnswer;
  } catch (e) {
    throw new Error(
      "Short answer response was not valid JSON: " + generatedMessage
    );
  }
};

const completeRequirement = async (messages) => {};

module.exports = {
  getResponse,
  getInitialResponse,
  getLLMResponse,
  generateQuiz,
  generateShortAnswer,
  useTool,
};
// Windows PowerShell/cmd users: use this syntax instead of Unix-style curl
// You can use Invoke-WebRequest in PowerShell:

// Invoke-WebRequest -Uri "http://localhost:3001/api/agents/response" `
//   -Method POST `
//   -ContentType "application/json" `
//   -Body '{
//     "messages": [
//       {"role": "user", "content": "Hello, how are you?"}
//     ]
//   }'
