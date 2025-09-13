import { GeminiClient } from '../llm/gemini.js';
import { getModulesPrompt } from '../prompts.js';
import { ModulesResult } from '../types.js';

export async function runModules(text: string): Promise<ModulesResult> {
  const client = new GeminiClient();
  const prompt = getModulesPrompt(text, 12);
  
  console.log('🤖 Generating modules with Gemini...');
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
    
    const result = JSON.parse(jsonText) as ModulesResult;
    
    // Validate structure
    if (!result.modules || !Array.isArray(result.modules)) {
      throw new Error('Invalid modules structure');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to parse modules JSON:', response);
    
    // Try to extract and fix the JSON manually
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let fixedJson = jsonMatch[0];
        fixedJson = fixedJson.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        const result = JSON.parse(fixedJson) as ModulesResult;
        if (result.modules && Array.isArray(result.modules)) {
          console.log('Successfully parsed JSON after manual extraction');
          return result;
        }
      }
    } catch (fixError) {
      console.error('Manual JSON extraction also failed:', fixError);
    }
    
    throw new Error(`Failed to parse modules response: ${error}`);
  }
}
