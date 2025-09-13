/**
 * Validators for AI outputs
 * Handles JSON parsing and Mermaid code extraction with error handling
 */

export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface QuizItem {
  q: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface SyllabusNode {
  id: string;
  title: string;
  parents: string[];
}

export interface SyllabusMap {
  nodes: SyllabusNode[];
}

/**
 * Parse quiz JSON from AI response
 */
export function parseQuizJson(text: string): ValidationResult<QuizItem[]> {
  try {
    // Extract JSON from text (handle cases where AI adds extra text)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return { ok: false, error: "No JSON array found in response" };
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!Array.isArray(parsed)) {
      return { ok: false, error: "Response is not an array" };
    }
    
    for (const item of parsed) {
      if (!item.q || !item.choices || !Array.isArray(item.choices) || 
          item.choices.length !== 4 || typeof item.correctIndex !== 'number' || 
          !item.explanation) {
        return { ok: false, error: "Invalid quiz item structure" };
      }
    }
    
    return { ok: true, data: parsed };
  } catch (error) {
    return { ok: false, error: `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Parse syllabus map JSON from AI response
 */
export function parseSyllabusMap(text: string): ValidationResult<SyllabusMap> {
  try {
    // Extract JSON from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { ok: false, error: "No JSON object found in response" };
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
      return { ok: false, error: "Missing or invalid nodes array" };
    }
    
    for (const node of parsed.nodes) {
      if (!node.id || !node.title || !Array.isArray(node.parents)) {
        return { ok: false, error: "Invalid node structure" };
      }
    }
    
    return { ok: true, data: parsed };
  } catch (error) {
    return { ok: false, error: `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Extract Mermaid code from AI response
 */
export function extractMermaid(text: string): ValidationResult<string> {
  try {
    // Look for fenced code blocks
    const mermaidMatch = text.match(/```mermaid\s*\n([\s\S]*?)\n```/i);
    if (mermaidMatch) {
      const code = mermaidMatch[1].trim();
      if (code.length === 0) {
        return { ok: false, error: "Empty Mermaid code block" };
      }
      return { ok: true, data: code };
    }
    
    // Fallback: look for any code block
    const codeMatch = text.match(/```\s*\n([\s\S]*?)\n```/);
    if (codeMatch) {
      const code = codeMatch[1].trim();
      // Basic validation - check for common Mermaid keywords
      if (code.includes('graph') || code.includes('flowchart') || code.includes('-->') || code.includes('---')) {
        return { ok: true, data: code };
      }
    }
    
    return { ok: false, error: "No valid Mermaid code block found" };
  } catch (error) {
    return { ok: false, error: `Mermaid extraction error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Validate Mermaid syntax (basic check)
 */
export function validateMermaidSyntax(code: string): ValidationResult<string> {
  // Basic syntax validation
  const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) {
    return { ok: false, error: "Empty diagram" };
  }
  
  // Check for diagram type declaration
  const firstLine = lines[0].toLowerCase();
  if (!firstLine.includes('graph') && !firstLine.includes('flowchart') && 
      !firstLine.includes('sequence') && !firstLine.includes('class') &&
      !firstLine.includes('state') && !firstLine.includes('er') &&
      !firstLine.includes('journey') && !firstLine.includes('gantt')) {
    return { ok: false, error: "Missing diagram type declaration" };
  }
  
  // Check for basic structure (at least one connection or node)
  const hasConnections = lines.some(line => line.includes('-->') || line.includes('---') || line.includes('->'));
  const hasNodes = lines.some(line => /^[A-Za-z0-9_]+/.test(line));
  
  if (!hasConnections && !hasNodes) {
    return { ok: false, error: "No nodes or connections found" };
  }
  
  return { ok: true, data: code };
}
