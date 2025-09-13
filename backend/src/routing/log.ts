export function logRoute(event: { task: string; model: string; latencyMs: number; ok: boolean; usedFallback: boolean; shadowModel?: string; tokensIn?: number }) {
  const payload = {
    t: new Date().toISOString(),
    ...event,
  };
  // Keep it short JSON
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}


