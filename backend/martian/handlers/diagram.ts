/**
 * Mermaid diagram generation handler
 * POST /api/martian/diagram
 */

import { callAI } from '../router';
import { buildMermaidPrompt } from '../prompts';

export interface DiagramRequest {
  nodeTitle: string;
  scope?: string;
}

export interface DiagramResponse {
  mermaid: string;
  repaired: boolean;
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

export async function handleDiagram(request: DiagramRequest): Promise<DiagramResponse> {
  const { nodeTitle, scope } = request;

  if (!nodeTitle || typeof nodeTitle !== 'string') {
    throw new Error('Node title is required and must be a string');
  }

  const prompt = buildMermaidPrompt(nodeTitle, scope);
  const messages = [
    { role: 'system' as const, content: prompt.system },
    { role: 'user' as const, content: prompt.user }
  ];

  const result = await callAI({
    taskType: 'diagram_mermaid',
    messages,
    expect: 'mermaid'
  });

  if (!result.mermaid) {
    throw new Error('Failed to generate valid Mermaid diagram');
  }

  return {
    mermaid: result.mermaid,
    repaired: result.repaired || false,
    meta: result.meta,
    logged: true,
  };
}
