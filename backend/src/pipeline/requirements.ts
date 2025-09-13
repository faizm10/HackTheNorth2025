import { GeminiClient } from '../llm/gemini.js';
import { chunkRequirementsPrompt } from '../prompts.js';
import { Requirement } from '../types.js';

export async function extractChunkRequirements(
  chunkId: string,
  chunkText: string,
  moduleId: string,
  moduleTitle: string
): Promise<Requirement[]> {
  const client = new GeminiClient();
  const prompt = chunkRequirementsPrompt(chunkText, moduleTitle);

  const response = await client.generateContent(prompt);
  
  try {
    // Extract JSON from markdown code blocks if present
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to fix common JSON issues
    jsonText = jsonText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']'); // Remove trailing commas
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, ''); // Remove any remaining markdown
    
    const parsed = JSON.parse(jsonText) as { requirements: Array<{ description: string; priority: 'high' | 'medium' | 'low'; category: string; }> };
    
    // Validate structure
    if (!parsed.requirements || !Array.isArray(parsed.requirements)) {
      throw new Error('Invalid requirements structure');
    }
    
    return parsed.requirements.map((r, index) => ({
      id: `r-${chunkId}-${index + 1}`,
      description: r.description,
      priority: r.priority,
      category: r.category,
      module_id: moduleId,
      chunk_id: chunkId
    }));
  } catch (error) {
    console.error(`Failed to parse requirements for chunk ${chunkId}:`, error);
    return [];
  }
}
