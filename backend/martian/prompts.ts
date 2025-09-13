/**
 * Task-specific prompt builders for Martian AI routing
 * Each function returns a concise system/user prompt pair
 */

export interface PromptPair {
  system: string;
  user: string;
}

/**
 * Build prompt for syllabus map generation
 * Returns JSON with nodes array: { id, title, parents[] }
 */
export function buildSyllabusPrompt(topic: string, baselineAnswers?: string[]): PromptPair {
  const context = baselineAnswers?.length ? `\n\nPrevious context: ${baselineAnswers.join(', ')}` : '';
  
  return {
    system: "You are an expert educational content organizer. Generate a structured syllabus map as JSON.",
    user: `Create a syllabus map for "${topic}". Return ONLY valid JSON with this exact schema: {"nodes":[{"id":"string","title":"string","parents":["string"]}]}. Each node should represent a key concept with logical parent-child relationships.${context}`
  };
}

/**
 * Build prompt for overview generation
 * Returns plain text explanation
 */
export function buildOverviewPrompt(nodeTitle: string, scope?: string): PromptPair {
  const scopeContext = scope ? ` within the scope of ${scope}` : '';
  
  return {
    system: "You are a clear, concise educational writer. Provide helpful overviews that are easy to understand.",
    user: `Write a clear, concise overview of "${nodeTitle}"${scopeContext}. Keep it under 200 words and focus on key concepts and practical applications.`
  };
}

/**
 * Build prompt for Mermaid diagram generation
 * Returns single fenced code block with Mermaid syntax
 */
export function buildMermaidPrompt(nodeTitle: string, scope?: string): PromptPair {
  const scopeContext = scope ? ` within the scope of ${scope}` : '';
  
  return {
    system: "You are a technical diagram expert. Create clear, well-structured Mermaid diagrams.",
    user: `Create a Mermaid diagram for "${nodeTitle}"${scopeContext}. Return ONLY a single fenced code block with valid Mermaid syntax. Use appropriate diagram type (flowchart, graph, etc.) and keep it simple but informative.`
  };
}

/**
 * Build prompt for Mermaid diagram repair
 * Fixes broken or invalid Mermaid code
 */
export function buildMermaidRepairPrompt(code: string, error: string): PromptPair {
  return {
    system: "You are a Mermaid syntax expert. Fix broken diagram code to make it valid and renderable.",
    user: `Fix this broken Mermaid code:\n\n\`\`\`mermaid\n${code}\n\`\`\`\n\nError: ${error}\n\nReturn ONLY the corrected Mermaid code in a single fenced code block.`
  };
}

/**
 * Build prompt for quiz MCQ generation
 * Returns JSON array with questions: { q, choices[], correctIndex, explanation }
 */
export function buildQuizPrompt(nodeTitle: string, scope?: string): PromptPair {
  const scopeContext = scope ? ` within the scope of ${scope}` : '';
  
  return {
    system: "You are an expert quiz creator. Generate high-quality multiple choice questions that test understanding.",
    user: `Create 3-5 multiple choice questions about "${nodeTitle}"${scopeContext}. Return ONLY valid JSON array with this exact schema: [{"q":"string","choices":["string","string","string","string"],"correctIndex":0,"explanation":"string"}]. Make questions challenging but fair, with clear explanations.`
  };
}

/**
 * Build prompt for knowledge check
 * Returns plain text assessment
 */
export function buildKnowledgeCheckPrompt(topic: string, userInput: string): PromptPair {
  return {
    system: "You are an educational assessor. Provide constructive feedback on student understanding.",
    user: `Assess this response about "${topic}":\n\n"${userInput}"\n\nProvide constructive feedback in 2-3 sentences. Highlight what's correct, what could be improved, and suggest next steps for learning.`
  };
}
