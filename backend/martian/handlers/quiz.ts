/**
 * Quiz MCQ generation handler
 * POST /api/martian/quiz
 */

import { callAI } from '../router';
import { buildQuizPrompt } from '../prompts';

export interface QuizRequest {
  nodeTitle: string;
  scope?: string;
}

export interface QuizItem {
  q: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface QuizResponse {
  items: QuizItem[];
  meta: {
    taskType: string;
    model: string;
    latency_ms: number;
    tokens_in?: number;
    tokens_out?: number;
    cost_est?: number;
    valid_json?: boolean;
    repaired?: boolean;
  };
  logged: boolean;
}

export async function handleQuiz(request: QuizRequest): Promise<QuizResponse> {
  const { nodeTitle, scope } = request;

  if (!nodeTitle || typeof nodeTitle !== 'string') {
    throw new Error('Node title is required and must be a string');
  }

  const prompt = buildQuizPrompt(nodeTitle, scope);
  const messages = [
    { role: 'system' as const, content: prompt.system },
    { role: 'user' as const, content: prompt.user }
  ];

  const result = await callAI({
    taskType: 'quiz_mcq',
    messages,
    expect: 'json',
    schema: '[{"q":"string","choices":["string","string","string","string"],"correctIndex":0,"explanation":"string"}]'
  });

  if (!result.json || !Array.isArray(result.json)) {
    throw new Error('Failed to generate valid quiz questions');
  }

  return {
    items: result.json,
    meta: result.meta,
    logged: true,
  };
}
