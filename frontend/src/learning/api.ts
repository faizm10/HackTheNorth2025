// Lightweight API client for agent and grading endpoints

export type ApiRole = "user" | "assistant" | "system";

export interface ApiMessage {
  role: ApiRole;
  content: string;
}

export interface QuizOption {
  label: string;
  content: string;
}

export interface QuizToolData {
  question: string;
  options: QuizOption[];
  answer?: string;
}

export interface ShortAnswerToolData {
  question: string;
  idealAnswer: string;
}

export type ToolPayload =
  | { type: "quiz"; data: QuizToolData }
  | { type: "shortAnswer"; data: ShortAnswerToolData }
  | { type: "grading"; data: { passed: boolean; feedback: string } };

export interface AssistantMessage {
  role: "assistant";
  content: string;
  tool?: ToolPayload;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";

async function doJson<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
  }
  return (await res.json()) as T;
}

export async function getInitialAgentResponse(
  messages?: ApiMessage[],
  meta?: {
    requirements?: Array<string | { description: string }>;
    currentRequirementIndex?: number;
    currentModule?: string;
  }
): Promise<{ success: boolean; message: AssistantMessage }> {
  return doJson("/api/agent/initial-response", {
    messages: messages ?? [],
    ...(meta?.requirements ? { requirements: meta.requirements } : {}),
    ...(typeof meta?.currentRequirementIndex === "number"
      ? { currentRequirementIndex: meta.currentRequirementIndex }
      : {}),
    ...(meta?.currentModule ? { currentModule: meta.currentModule } : {}),
  });
}

export async function sendAgentResponse(
  messages: ApiMessage[],
  opts?: {
    model?: string;
    requirements?: Array<string | { description: string }>;
    currentRequirementIndex?: number;
    currentModule?: string;
  }
): Promise<{ success: boolean; message: AssistantMessage }> {
  return doJson("/api/agent/response", {
    messages,
    ...(opts?.model ? { model: opts.model } : {}),
    ...(opts?.requirements ? { requirements: opts.requirements } : {}),
    ...(typeof opts?.currentRequirementIndex === "number"
      ? { currentRequirementIndex: opts.currentRequirementIndex }
      : {}),
    ...(opts?.currentModule ? { currentModule: opts.currentModule } : {}),
  });
}

export async function gradeAnswer(input: {
  question: string;
  answer: string;
  messages?: ApiMessage[];
}): Promise<{
  success: boolean;
  grading: { passed: boolean; feedback: string };
  response: AssistantMessage;
}> {
  return doJson("/api/grading/grade", input);
}
