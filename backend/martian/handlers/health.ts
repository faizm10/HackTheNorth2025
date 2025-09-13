/**
 * Health check handler
 * GET /api/martian/health
 */

import { martianClient } from '../client';
import { readFileSync } from 'fs';
import { join } from 'path';

const policy = JSON.parse(readFileSync(join(__dirname, '../policy.json'), 'utf-8'));

export interface HealthResponse {
  ok: boolean;
  models: number;
  api_connected: boolean;
  timestamp: number;
  version: string;
}

export async function handleHealth(): Promise<HealthResponse> {
  const timestamp = Date.now();
  
  try {
    // Test API connectivity
    const apiConnected = await martianClient.healthCheck();
    
    // Count available models
    const modelCount = Object.keys(policy.routes).length;
    
    return {
      ok: true,
      models: modelCount,
      api_connected: apiConnected,
      timestamp,
      version: policy.version,
    };
  } catch (error) {
    return {
      ok: false,
      models: 0,
      api_connected: false,
      timestamp,
      version: policy.version,
    };
  }
}
