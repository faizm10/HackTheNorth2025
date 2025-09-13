/**
 * Main AI router that handles task-based routing to Martian models
 * Implements fallback logic, validation, and repair mechanisms
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { martianClient, ChatMessage } from './client';
import { estimateCost } from './cost-map';
import { aiLogger, AIMeta } from './log';
import { parseQuizJson, parseSyllabusMap, extractMermaid, validateMermaidSyntax } from './validators';
import { buildMermaidRepairPrompt } from './prompts';

export interface Policy {
  version: string;
  defaults: {
    temperature: number;
    max_tokens: number;
    retries: number;
    timeout_ms: number;
  };
  routes: Record<string, {
    preferred: string[];
    fallbacks: string[];
  }>;
}

export interface CallAIRequest {
  taskType: string;
  messages: ChatMessage[];
  expect?: 'text' | 'json' | 'mermaid';
  schema?: string;
}

export interface CallAIResponse {
  text?: string;
  json?: any;
  mermaid?: string;
  meta: AIMeta;
  repaired?: boolean;
}

// Load policy configuration
let policy: Policy;
try {
  const policyPath = join(__dirname, 'policy.json');
  policy = JSON.parse(readFileSync(policyPath, 'utf-8'));
} catch (error) {
  throw new Error(`Failed to load policy.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

/**
 * Main AI routing function
 */
export async function callAI(request: CallAIRequest): Promise<CallAIResponse> {
  const { taskType, messages, expect = 'text', schema } = request;
  const startTime = Date.now();
  
  // Get route configuration
  const route = policy.routes[taskType];
  if (!route) {
    throw new Error(`Unknown task type: ${taskType}`);
  }

  // Try preferred models first, then fallbacks
  const allModels = [...route.preferred, ...route.fallbacks];
  let lastError: Error | null = null;

  for (const model of allModels) {
    try {
      const result = await attemptCall(model, messages, route, expect, schema);
      const latency = Date.now() - startTime;
      
      // Create metadata
      const meta: AIMeta = {
        taskType,
        model,
        latency_ms: latency,
        tokens_in: result.tokens_in,
        tokens_out: result.tokens_out,
        cost_est: result.cost_est,
        valid_json: result.valid_json,
        repaired: result.repaired,
      };

      // Log the call
      aiLogger.logAI(meta);

      return {
        text: result.text,
        json: result.json,
        mermaid: result.mermaid,
        meta,
        repaired: result.repaired,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Model ${model} failed for task ${taskType}:`, lastError.message);
    }
  }

  // All models failed, return mock response
  const latency = Date.now() - startTime;
  const meta: AIMeta = {
    taskType,
    model: 'mock/offline',
    latency_ms: latency,
    cost_est: 0,
  };

  aiLogger.logAI(meta);

  return {
    text: `Mock response for ${taskType} (all models failed: ${lastError?.message})`,
    meta,
  };
}

/**
 * Attempt a single model call with validation and repair
 */
async function attemptCall(
  model: string,
  messages: ChatMessage[],
  route: Policy['routes'][string],
  expect: string,
  schema?: string
): Promise<{
  text?: string;
  json?: any;
  mermaid?: string;
  tokens_in?: number;
  tokens_out?: number;
  cost_est?: number;
  valid_json?: boolean;
  repaired?: boolean;
}> {
  const response = await martianClient.chatCompletion({
    model,
    messages,
    temperature: policy.defaults.temperature,
    max_tokens: policy.defaults.max_tokens,
  });

  const choice = response.choices[0];
  if (!choice) {
    throw new Error('No response from model');
  }

  const text = choice.message.content;
  const tokens_in = response.usage?.prompt_tokens;
  const tokens_out = response.usage?.completion_tokens;
  const cost_est = tokens_in && tokens_out ? estimateCost(model, tokens_in, tokens_out) : undefined;

  // Handle different expected output types
  switch (expect) {
    case 'json':
      return handleJsonOutput(text, model, messages, schema, tokens_in, tokens_out, cost_est);
    
    case 'mermaid':
      return handleMermaidOutput(text, model, messages, tokens_in, tokens_out, cost_est);
    
    default:
      return { text, tokens_in, tokens_out, cost_est };
  }
}

/**
 * Handle JSON output with validation and repair
 */
async function handleJsonOutput(
  text: string,
  model: string,
  originalMessages: ChatMessage[],
  schema: string | undefined,
  tokens_in?: number,
  tokens_out?: number,
  cost_est?: number
) {
  // Try to parse as quiz JSON first
  const quizResult = parseQuizJson(text);
  if (quizResult.ok) {
    return {
      json: quizResult.data,
      tokens_in,
      tokens_out,
      cost_est,
      valid_json: true,
    };
  }

  // Try to parse as syllabus map
  const mapResult = parseSyllabusMap(text);
  if (mapResult.ok) {
    return {
      json: mapResult.data,
      tokens_in,
      tokens_out,
      cost_est,
      valid_json: true,
    };
  }

  // If validation failed and we have a schema, attempt repair
  if (schema) {
    try {
      const repairMessages: ChatMessage[] = [
        ...originalMessages,
        {
          role: 'user',
          content: `The previous response was invalid JSON. Please fix it to match this schema: ${schema}. Return only valid JSON.`
        }
      ];

      const repairResponse = await martianClient.chatCompletion({
        model,
        messages: repairMessages,
        temperature: policy.defaults.temperature,
        max_tokens: policy.defaults.max_tokens,
      });

      const repairText = repairResponse.choices[0]?.message.content;
      if (repairText) {
        const repairQuizResult = parseQuizJson(repairText);
        if (repairQuizResult.ok) {
          return {
            json: repairQuizResult.data,
            tokens_in: (tokens_in || 0) + (repairResponse.usage?.prompt_tokens || 0),
            tokens_out: (tokens_out || 0) + (repairResponse.usage?.completion_tokens || 0),
            cost_est: cost_est ? cost_est + estimateCost(model, repairResponse.usage?.prompt_tokens || 0, repairResponse.usage?.completion_tokens || 0) : undefined,
            valid_json: true,
            repaired: true,
          };
        }

        const repairMapResult = parseSyllabusMap(repairText);
        if (repairMapResult.ok) {
          return {
            json: repairMapResult.data,
            tokens_in: (tokens_in || 0) + (repairResponse.usage?.prompt_tokens || 0),
            tokens_out: (tokens_out || 0) + (repairResponse.usage?.completion_tokens || 0),
            cost_est: cost_est ? cost_est + estimateCost(model, repairResponse.usage?.prompt_tokens || 0, repairResponse.usage?.completion_tokens || 0) : undefined,
            valid_json: true,
            repaired: true,
          };
        }
      }
    } catch (error) {
      console.warn('JSON repair failed:', error);
    }
  }

  // Return original text if repair failed
  return {
    text,
    tokens_in,
    tokens_out,
    cost_est,
    valid_json: false,
  };
}

/**
 * Handle Mermaid output with validation and repair
 */
async function handleMermaidOutput(
  text: string,
  model: string,
  originalMessages: ChatMessage[],
  tokens_in?: number,
  tokens_out?: number,
  cost_est?: number
) {
  const mermaidResult = extractMermaid(text);
  if (mermaidResult.ok) {
    const syntaxResult = validateMermaidSyntax(mermaidResult.data!);
    if (syntaxResult.ok) {
      return {
        mermaid: syntaxResult.data,
        tokens_in,
        tokens_out,
        cost_est,
        valid_json: true,
      };
    }
  }

  // Attempt repair using diagram_repair task
  try {
    const repairPrompt = buildMermaidRepairPrompt(text, mermaidResult.error || 'Invalid syntax');
    const repairMessages: ChatMessage[] = [
      { role: 'system', content: repairPrompt.system },
      { role: 'user', content: repairPrompt.user }
    ];

    const repairResponse = await martianClient.chatCompletion({
      model,
      messages: repairMessages,
      temperature: policy.defaults.temperature,
      max_tokens: policy.defaults.max_tokens,
    });

    const repairText = repairResponse.choices[0]?.message.content;
    if (repairText) {
      const repairResult = extractMermaid(repairText);
      if (repairResult.ok) {
        const repairSyntaxResult = validateMermaidSyntax(repairResult.data!);
        if (repairSyntaxResult.ok) {
          return {
            mermaid: repairSyntaxResult.data,
            tokens_in: (tokens_in || 0) + (repairResponse.usage?.prompt_tokens || 0),
            tokens_out: (tokens_out || 0) + (repairResponse.usage?.completion_tokens || 0),
            cost_est: cost_est ? cost_est + estimateCost(model, repairResponse.usage?.prompt_tokens || 0, repairResponse.usage?.completion_tokens || 0) : undefined,
            valid_json: true,
            repaired: true,
          };
        }
      }
    }
  } catch (error) {
    console.warn('Mermaid repair failed:', error);
  }

  // Return original text if repair failed
  return {
    text,
    tokens_in,
    tokens_out,
    cost_est,
    valid_json: false,
  };
}
