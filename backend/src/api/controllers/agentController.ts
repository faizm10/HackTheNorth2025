import {
  getLLMCompletion,
  chatCompletionsCreate,
  DEFAULT_MODEL,
} from "./llmAPI.js";
import { Request, Response } from "express";
import { ChatCompletionMessageParam } from "openai/resources";

type ChatRole = "system" | "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

const MODEL = DEFAULT_MODEL;

const context = {
  currentRequirement: "The user must understand the concept of addition",
  completedRequirements: ["something"],
  currentModule: "Module 1",
};

const TOOLS: any[] = [
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
];

export const getResponse = async (req: Request, res: Response) => {
  try {
    const { messages, model = MODEL } = req.body as {
      messages: ChatMessage[];
      model?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error:
          "Invalid request: messages array is required and cannot be empty",
      });
    }

    for (const message of messages) {
      if (!message.role || !message.content) {
        return res.status(400).json({
          error:
            "Invalid message format: each message must have 'role' and 'content' properties",
        });
      }
    }

    const result: any = await getLLMCompletion([
      ...messages,
      {
        role: "system",
        content:
          "Based on the conversation, return to me only the string 'TEACH' if our next message should be a teaching message, or the string 'ASSESS' if our next message should assess the users knowledge on the current requirement ",
      },
    ]);

    const mode = result.choices?.[0]?.message?.content || "TEACH";

    const generatedMessage = await getLLMResponse(messages, { mode, model });

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

export const getInitialResponse = async (req: Request, res: Response) => {
  try {
    const { messages = [] } = (req.body || {}) as { messages?: ChatMessage[] };

    const messagesWithSystem: ChatMessage[] = [
      ...((Array.isArray(messages) && messages.length > 0
        ? messages
        : []) as ChatMessage[]),
      {
        role: "system",
        content:
          "You are an AI tutor agent. You are teaching the user a new module. teach the current requirement. Teach the user on a fundamental level on the requirement.Use tools available to you to assess the users understanding. Finally, when the user fully understands a requirement, use a complete tool. Begin by generating an educational lesson onCurrent Requirement: " +
          context.currentRequirement,
      },
    ];

    const generatedMessage = await getLLMCompletion(messagesWithSystem);

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

const useTool = async (toolCalls: any, messages: ChatMessage[]) => {
  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  const toolCall = toolCalls[0];
  const functionName = toolCall.function.name as string;

  try {
    let result: any;

    switch (functionName) {
      case "generateQuiz":
        result = await generateQuiz(messages);
        return {
          role: "assistant",
          content: "Here's a short quiz:",
          tool: { type: "quiz", data: result },
        };
      case "generateShortAnswer":
        result = await generateShortAnswer(messages);
        return {
          role: "assistant",
          content: "Here's a short answer question:",
          tool: { type: "shortAnswer", data: result },
        };
      default:
        throw new Error(`Unknown tool: ${functionName}`);
    }
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

export const getLLMResponse = async (
  messages: ChatMessage[],
  extraContext: Record<string, any>
) => {
  const model = (extraContext?.model as string) || MODEL;

  try {
    const completion: any = await chatCompletionsCreate({
      model,
      messages: [
        ...messages,
        { role: "system", content: JSON.stringify(extraContext) },
      ] as any,
      tools: TOOLS as any,
      tool_choice: "auto",
    });

    const responseMessage = completion.choices?.[0]?.message;
    if (!responseMessage) {
      throw new Error("Failed to generate response from Cohere");
    }

    if ((responseMessage as any).tool_calls) {
      const toolResponse = await useTool(
        (responseMessage as any).tool_calls,
        messages
      );
      if (toolResponse) {
        return { ...responseMessage, ...toolResponse };
      }
    }

    return responseMessage;
  } catch (error) {
    throw error;
  }
};

export const generateQuiz = async (messages: ChatCompletionMessageParam[]) => {
  const promptMessages = [
    ...messages,
    {
      role: "system",
      content:
        'Given the conversation so far, generate a quiz question with multiple choice options. Respond ONLY in the following JSON format: { "options": [ { "label": "A", "content": "Option 1" }, { "label": "B", "content": "Option 2" }, ... ], "answer": "string", "question": "string" }. Do not include any explanation or extra text.',
    } as ChatCompletionMessageParam,
  ];

  const completion: any = await getLLMCompletion(promptMessages);
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

export const generateShortAnswer = async (
  messages: ChatCompletionMessageParam[]
) => {
  const promptMessages: ChatCompletionMessageParam[] = [
    ...messages,
    {
      role: "system",
      content:
        'Generate a short answer question based on the conversation and the current requirement. Respond ONLY in the following JSON format: { "question": "string", "idealAnswer": "string" }. Do not include any explanation or extra text.',
    } as ChatCompletionMessageParam,
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
