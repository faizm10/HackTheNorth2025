/**
 * Cost estimation map for Martian models
 * Prices in USD per 1M tokens (input/output)
 * Based on Martian pricing documentation
 */

export interface CostMap {
  [model: string]: {
    in: number;  // $ per 1M input tokens
    out: number; // $ per 1M output tokens
  };
}

export const COST_MAP: CostMap = {
  // Google models
  "google/gemini-2.5-flash": { in: 0.075, out: 0.30 },
  "google/gemini-2.5-pro": { in: 1.25, out: 5.00 },
  
  // OpenAI models
  "openai/gpt-4.1": { in: 2.50, out: 10.00 },
  "openai/gpt-4.1-nano:cheap": { in: 0.15, out: 0.60 },
  "openai/gpt-4o-mini": { in: 0.15, out: 0.60 },
  
  // Anthropic models
  "anthropic/claude-3-5-sonnet-20240620": { in: 3.00, out: 15.00 },
  
  // Cohere models
  "cohere/command-r-08-2024": { in: 0.50, out: 1.50 },
  "cohere/command-r-plus-08-2024": { in: 1.00, out: 3.00 },
  
  // Martian models
  "martian/code": { in: 0.20, out: 0.80 },
  
  // Mistral models
  "mistralai/devstral-small": { in: 0.20, out: 0.60 },
  
  // Mock/fallback
  "mock/offline": { in: 0, out: 0 }
};

/**
 * Calculate estimated cost for a model call
 */
export function estimateCost(
  model: string, 
  inputTokens: number, 
  outputTokens: number
): number {
  const pricing = COST_MAP[model];
  if (!pricing) {
    // Default to GPT-4 pricing if model not found
    return (inputTokens * 2.50 + outputTokens * 10.00) / 1e6;
  }
  
  return (inputTokens * pricing.in + outputTokens * pricing.out) / 1e6;
}

/**
 * Get baseline cost for comparison (using GPT-4.1 as baseline)
 */
export function getBaselineCost(inputTokens: number, outputTokens: number): number {
  return estimateCost("openai/gpt-4.1", inputTokens, outputTokens);
}
