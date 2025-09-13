import crypto from 'crypto';
import { pickRoute } from './pickRoute.js';
import { callMartian } from './martianClient.js';
import { validateJSON } from './validate.js';
import { getCache, setCache } from './cache.js';
import { logRoute } from './log.js';

type SchemaName = 'modules' | 'assignments' | 'quiz' | 'overview' | 'diagram';

export async function routeAndCall(
  task: string,
  prompt: string,
  opts: { requireJson: boolean; schemaName: SchemaName; userMode?: 'quality' | 'balanced' | 'cheap'; tokensInEstimate?: number }
): Promise<{ text: string; modelUsed: string; latencyMs: number; validated?: any }> {
  const { userMode, tokensInEstimate, requireJson, schemaName } = opts;
  const cacheKey = crypto.createHash('sha256').update(`${task}|${schemaName}|${userMode}|${prompt}`).digest('hex');
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { primaryModel, fallbackModel, maxLatencyMs } = pickRoute(task, { tokensIn: tokensInEstimate, requireJson, userMode });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), maxLatencyMs);

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (requireJson) {
    messages.push({ role: 'system', content: `ONLY return minified valid JSON for schema ${schemaName}. No prose, no markdown.` });
  }
  messages.push({ role: 'user', content: prompt });

  const abPercent = Number(process.env.AB_SHADOW_PERCENT || '0');
  const maybeShadow = Math.random() < abPercent;

  async function callAndValidate(model: string) {
    const res = await callMartian(model, messages, { signal: controller.signal });
    let validated: any;
    let ok = res.status === 200;
    if (ok && requireJson) {
      const v = validateJSON(res.text, schemaName as any);
      ok = v.ok;
      if (ok) validated = v.data;
    }
    return { ok, res, validated };
  }

  try {
    const primary = await callAndValidate(primaryModel);
    logRoute({ task, model: primaryModel, latencyMs: primary.res.latencyMs, ok: primary.ok, usedFallback: false, tokensIn: tokensInEstimate });
    if (maybeShadow) {
      // fire-and-forget shadow
      callAndValidate(fallbackModel).then(s => logRoute({ task, model: fallbackModel, latencyMs: s.res.latencyMs, ok: s.ok, usedFallback: false, shadowModel: primaryModel, tokensIn: tokensInEstimate })).catch(() => {});
    }
    if (primary.ok) {
      clearTimeout(timeout);
      const value = { text: primary.res.text, modelUsed: primaryModel, latencyMs: primary.res.latencyMs, validated: primary.validated };
      setCache(cacheKey, value);
      return value;
    }

    const fallback = await callAndValidate(fallbackModel);
    logRoute({ task, model: fallbackModel, latencyMs: fallback.res.latencyMs, ok: fallback.ok, usedFallback: true, shadowModel: primaryModel, tokensIn: tokensInEstimate });
    clearTimeout(timeout);
    const value = { text: fallback.res.text, modelUsed: fallbackModel, latencyMs: fallback.res.latencyMs, validated: fallback.validated };
    if (fallback.ok) setCache(cacheKey, value);
    return value;
  } catch (e: any) {
    clearTimeout(timeout);
    throw e;
  }
}


