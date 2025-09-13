/**
 * Overview generation handler
 * POST /api/martian/overview
 */

import { callAI } from '../router';
import { buildOverviewPrompt } from '../prompts';

export interface OverviewRequest {
  nodeTitle: string;
  scope?: string;
}

export interface OverviewResponse {
  text: string;
  meta: {
    taskType: string;
    model: string;
    latency_ms: number;
    tokens_in?: number;
    tokens_out?: number;
    cost_est?: number;
  };
  logged: boolean;
}

export async function handleOverview(request: OverviewRequest): Promise<OverviewResponse> {
  const { nodeTitle, scope } = request;

  if (!nodeTitle || typeof nodeTitle !== 'string') {
    throw new Error('Node title is required and must be a string');
  }

  const prompt = buildOverviewPrompt(nodeTitle, scope);
  const messages = [
    { role: 'system' as const, content: prompt.system },
    { role: 'user' as const, content: prompt.user }
  ];

  const result = await callAI({
    taskType: 'overview',
    messages,
    expect: 'text'
  });

  if (!result.text) {
    throw new Error('Failed to generate overview');
  }

  return {
    text: result.text,
    meta: result.meta,
    logged: true,
  };
}
