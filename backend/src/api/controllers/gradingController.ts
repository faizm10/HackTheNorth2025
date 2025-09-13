import { ChatCompletionMessageParam } from "openai/resources";
import { getLLMCompletion } from "./llmAPI";
import { GradingResponse } from "../../types.js";

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
  "feedback": "Detailed feedback explaining why they passed or failed, including specific areas of strength or weakness"
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

${JSON.stringify(messageHistory, null, 2)}`,
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
    console.error("Error in gradeRequirementUnderstanding:", error);
    return {
      passed: false,
      feedback:
        "Unable to evaluate understanding at this time. Please try again.",
    };
  }
};
