import dotenv from 'dotenv';

dotenv.config();

export interface LLMClient {
  generateContent(prompt: string): Promise<string>;
}

class MartianClient implements LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.MARTIAN_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('MARTIAN_API_KEY environment variable is required for Martian provider');
    }
    this.baseUrl = (process.env.MARTIAN_BASE_URL || 'https://api.withmartian.com') + '/v1';
    const routing = (process.env.LLM_ROUTING || 'smart').toLowerCase();
    const configuredModel = process.env.LLM_MODEL;

    // Default to Martian smart routing when no explicit model is provided
    if (!configuredModel || configuredModel.toLowerCase() === 'auto') {
      if (routing === 'cheap') {
        // Cost-optimized default
        this.model = 'openai/gpt-4.1-nano:cheap';
      } else {
        // General smart router
        this.model = 'switchpoint/router';
      }
    } else {
      this.model = configuredModel;
    }
  }

  async generateContent(prompt: string): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;
    const task = process.env.LLM_ROUTER_TASK; // optional router hint (e.g., 'coding', 'informational')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        ...(task ? { task } : {})
      })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Martian API error: ${response.status} ${response.statusText} ${text}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}

class GeminiWrappedClient implements LLMClient {
  private impl: { generateContent(prompt: string): Promise<string> };

  constructor() {
    // Lazy import to avoid circular import issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GeminiClient } = require('./gemini.js');
    this.impl = new GeminiClient();
  }

  generateContent(prompt: string): Promise<string> {
    return this.impl.generateContent(prompt);
  }
}

export function getLlmClient(): LLMClient {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  if (provider === 'martian') {
    return new MartianClient();
  }
  return new GeminiWrappedClient();
}


