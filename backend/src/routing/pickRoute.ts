import fs from 'fs';
import path from 'path';

type Mode = 'quality' | 'balanced' | 'cheap';

type Policy = {
  defaults: { mode: Mode; max_latency_ms: number };
  modes: Record<Mode, { primary: string; fallback: string }>;
  tasks: Record<string, { mode: Mode }>;
};

let policyCache: Policy | null = null;

function loadPolicy(): Policy {
  if (policyCache) return policyCache;
  const file = path.join(process.cwd(), 'src', 'routing', 'policy.json');
  const raw = fs.readFileSync(file, 'utf-8');
  policyCache = JSON.parse(raw) as Policy;
  return policyCache;
}

export function pickRoute(
  task: string,
  opts: { tokensIn?: number; requireJson?: boolean; userMode?: Mode }
): { primaryModel: string; fallbackModel: string; maxLatencyMs: number } {
  const policy = loadPolicy();
  const envMode = (process.env.ROUTING_MODE as Mode | undefined);

  const mode: Mode =
    opts.userMode ||
    policy.tasks[task]?.mode ||
    envMode ||
    policy.defaults.mode;

  let { primary, fallback } = policy.modes[mode];

  // Heuristic tweak: very long inputs + quality → prefer Gemini flash
  if (opts.tokensIn && opts.tokensIn > 5000 && mode === 'quality') {
    primary = 'google/gemini-2.5-flash';
  }

  const maxLatencyMs = Number(process.env.ROUTING_MAX_LATENCY_MS || policy.defaults.max_latency_ms || 4500);

  return { primaryModel: primary, fallbackModel: fallback, maxLatencyMs };
}


