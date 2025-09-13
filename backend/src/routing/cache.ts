type Entry = { value: any; expires: number };
const store = new Map<string, Entry>();

export function getCache(hash: string): any | undefined {
  const e = store.get(hash);
  if (!e) return undefined;
  if (Date.now() > e.expires) {
    store.delete(hash);
    return undefined;
  }
  return e.value;
}

export function setCache(hash: string, value: any, ttlMs = 3600000): void {
  store.set(hash, { value, expires: Date.now() + ttlMs });
}


