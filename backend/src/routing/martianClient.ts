export async function callMartian(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  opts?: { max_tokens?: number; temperature?: number; signal?: AbortSignal }
): Promise<{ text: string; status: number; latencyMs: number; raw: any }> {
  const apiKey = process.env.MARTIAN_API_KEY || '';
  if (!apiKey) throw new Error('MARTIAN_API_KEY is required');

  const url = 'https://api.withmartian.com/v1/chat/completions';
  const body: any = {
    model,
    messages,
  };
  if (opts?.max_tokens !== undefined) body.max_tokens = opts.max_tokens;
  if (opts?.temperature !== undefined) body.temperature = opts.temperature;

  const started = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: opts?.signal,
  });
  const latencyMs = Date.now() - started;

  let raw: any;
  try {
    raw = await res.json();
  } catch {
    raw = await res.text();
  }

  const text = raw?.choices?.[0]?.message?.content ?? '';
  return { text, status: res.status, latencyMs, raw };
}


