import { ChatCompletionMessageParam } from "openai/resources";
import { getLLMCompletion } from "./llmAPI";

export const answerGrading = async (question: string, answer: string) => {
  const promptMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "Return a sentence describing if the user answered the question correctly or incorrectly.",
    },
    {
      role: "user",
      content: `Question: ${question}, Users Answer: ${answer}`,
    },
  ];

  return await getLLMCompletion(promptMessages);
};
