import { getLlmClient } from '../llm/provider.js';
import { assignChunkPrompt } from '../prompts.js';
import { Assignment, Chunk, ModulesResult } from '../types.js';

export async function runAssignments(
  chunks: Chunk[], 
  modules: ModulesResult
): Promise<Assignment[]> {
  const client = getLlmClient();
  const modulesJson = JSON.stringify(modules, null, 2);
  const assignments: Assignment[] = [];
  
  console.log(`🎯 Assigning ${chunks.length} chunks to modules...`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`  Processing chunk ${chunk.id} (${i + 1}/${chunks.length})`);
    
    try {
      const prompt = assignChunkPrompt(chunk.text, modulesJson);
      const response = await client.generateContent(prompt);
      
      // Extract JSON from markdown code blocks if present
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const assignment = JSON.parse(jsonText) as { module_id: string; confidence: number };
      
      assignments.push({
        chunk_id: chunk.id,
        module_id: assignment.module_id,
        confidence: assignment.confidence
      });
    } catch (error) {
      console.error(`Failed to assign chunk ${chunk.id}:`, error);
      // Fallback assignment
      assignments.push({
        chunk_id: chunk.id,
        module_id: 'none',
        confidence: 0.1
      });
    }
  }
  
  return assignments;
}
