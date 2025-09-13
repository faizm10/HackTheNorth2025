export type TaskName =
  | 'topic_map'
  | 'chunk_classify'
  | 'quiz_generate'
  | 'overview_summarize'
  | 'diagram_mermaid'
  | 'other';

export function classifyTask(input: { prompt: string; meta?: any }): TaskName {
  const prompt = (input.prompt || '').toLowerCase();

  const containsAny = (phrases: string[]) => phrases.some(p => prompt.includes(p));

  if (containsAny(['mind map', 'topics', 'syllabus'])) return 'topic_map';
  if (containsAny(['assign', 'which module', 'categorize', 'classification'])) return 'chunk_classify';
  if (containsAny(['quiz', 'questions', 'mcq', 'true/false', 'true or false'])) return 'quiz_generate';
  if (containsAny(['summary', 'overview', 'explain shortly'])) return 'overview_summarize';
  if (containsAny(['mermaid', 'diagram'])) return 'diagram_mermaid';

  return 'other';
}


