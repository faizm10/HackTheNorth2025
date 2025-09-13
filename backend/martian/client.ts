/**
 * Martian API client using OpenAI-compatible interface
 * Handles authentication, requests, and error handling
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export class MartianClient {
  private apiKey: string;
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.apiKey = process.env.MARTIAN_API_KEY || '';
    this.baseURL = process.env.MARTIAN_BASE_URL || 'https://api.withmartian.com/v1';
    this.timeout = parseInt(process.env.MARTIAN_TIMEOUT_MS || '20000');
    
    if (!this.apiKey) {
      throw new Error('MARTIAN_API_KEY environment variable is required');
    }
  }

  /**
   * Make a chat completion request to Martian API
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ChatCompletionError = await response.json().catch(() => ({
          error: {
            message: `HTTP ${response.status}: ${response.statusText}`,
            type: 'http_error',
            code: response.status.toString(),
          }
        }));
        throw new Error(errorData.error.message);
      }

      const data: ChatCompletionResponse = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Test API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.chatCompletion({
        model: 'openai/gpt-4o-mini', // Use a cheap model for health check
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      return response.choices.length > 0;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const martianClient = new MartianClient();
