import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

export const DEFAULT_MODEL = "command-a-reasoning-08-2025";

const openai = new OpenAI({
  apiKey:
    process.env.COHERE_API_KEY || "pJZf7BpJDXl16cgo4iI2adeSJp0B7kzxLHba6m7B",
  baseURL: "https://api.cohere.ai/compatibility/v1",
});

export async function getLLMCompletion(
  messages: ChatCompletionMessageParam[],
  model: string = DEFAULT_MODEL
): Promise<any> {
  const completion = await openai.chat.completions.create({
    model,
    messages,
  });
  return completion;
}

export async function chatCompletionsCreate(params: {
  model: string;
  messages: ChatCompletionMessageParam[];
  tools?: any;
  tool_choice?: any;
}): Promise<any> {
  return openai.chat.completions.create(params as any);
}
