/**
 * Syllabus map expansion handler
 * POST /api/martian/expand
 */

import { callAI } from '../router';
import { buildSyllabusPrompt } from '../prompts';

export interface ExpandRequest {
  topic: string;
  baselineAnswers?: string[];
}

export interface ExpandResponse {
  nodes: Array<{
    id: string;
    title: string;
    parents: string[];
  }>;
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

export async function handleExpand(request: ExpandRequest): Promise<ExpandResponse> {
  const { topic, baselineAnswers } = request;

  if (!topic || typeof topic !== 'string') {
    throw new Error('Topic is required and must be a string');
  }

  const prompt = buildSyllabusPrompt(topic, baselineAnswers);
  const messages = [
    { role: 'system' as const, content: prompt.system },
    { role: 'user' as const, content: prompt.user }
  ];

  const result = await callAI({
    taskType: 'syllabus_map',
    messages,
    expect: 'json',
    schema: '{"nodes":[{"id":"string","title":"string","parents":["string"]}]}'
  });

  if (!result.json) {
    throw new Error('Failed to generate valid syllabus map');
  }

  return {
    nodes: result.json.nodes,
    meta: result.meta,
    logged: true,
  };
}
