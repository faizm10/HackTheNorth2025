export function validateJSON<T>(rawText: string, schemaName: 'modules' | 'assignments' | 'quiz' | 'overview' | 'diagram'):
  { ok: boolean; data?: T; error?: string } {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  // remove trailing commas
  cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

  let data: any;
  try {
    data = JSON.parse(cleaned);
  } catch (e: any) {
    return { ok: false, error: `Invalid JSON: ${e?.message || 'parse error'}` };
  }

  const fail = (msg: string) => ({ ok: false, error: msg });

  switch (schemaName) {
    case 'modules': {
      if (!data || !Array.isArray(data.modules)) return fail('modules.modules must be array');
      for (const m of data.modules) {
        if (!m || typeof m.id !== 'string' || typeof m.title !== 'string' || typeof m.summary !== 'string') {
          return fail('modules entry invalid');
        }
      }
      return { ok: true, data } as any;
    }
    case 'assignments': {
      if (!data || !Array.isArray(data.assignments)) return fail('assignments.assignments must be array');
      for (const a of data.assignments) {
        if (!a || typeof a.chunk_id !== 'string' || typeof a.module_id !== 'string' || typeof a.confidence !== 'number') {
          return fail('assignment entry invalid');
        }
      }
      return { ok: true, data } as any;
    }
    case 'quiz': {
      if (!data || !Array.isArray(data.items)) return fail('quiz.items must be array');
      for (const it of data.items) {
        if (!it || typeof it.q !== 'string' || !Array.isArray(it.choices) || typeof it.correctIndex !== 'number' || typeof it.explanation !== 'string') {
          return fail('quiz item invalid');
        }
      }
      return { ok: true, data } as any;
    }
    case 'overview': {
      if (!data || typeof data.overview !== 'string') return fail('overview.overview must be string');
      return { ok: true, data } as any;
    }
    case 'diagram': {
      if (!data || typeof data.mermaid !== 'string' || typeof data.repaired !== 'boolean') return fail('diagram invalid');
      return { ok: true, data } as any;
    }
  }
}


