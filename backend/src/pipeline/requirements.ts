import { GeminiClient } from '../llm/gemini.js';
import { RequirementsResult } from '../types.js';

export async function extractRequirements(text: string): Promise<RequirementsResult> {
  const client = new GeminiClient();
  const prompt = `Analyze this text and extract learning requirements/prerequisites that users must fulfill to master each topic. These are actionable steps or knowledge prerequisites needed to progress through the content.

Text:
${text}

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "requirements": [
    {"id": "r1", "description": "Specific learning requirement or prerequisite", "priority": "high", "category": "Knowledge Area"},
    {"id": "r2", "description": "Another learning requirement", "priority": "medium", "category": "Skill Area"}
  ]
}

Instructions:
- Extract 8-20 learning requirements/prerequisites from the text
- These should be specific skills, knowledge, or abilities users need to acquire
- Priority: "high" for foundational requirements, "medium" for intermediate, "low" for advanced
- Category: Group by learning domains (e.g., "Technical Skills", "Communication", "Analysis", "Practice")
- Focus on measurable, actionable learning objectives
- Examples: "Understand core concepts", "Practice with examples", "Apply techniques", "Demonstrate competency"`;

  console.log('📋 Extracting requirements with Gemini...');
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
    
    const result = JSON.parse(jsonText) as RequirementsResult;
    
    // Validate structure
    if (!result.requirements || !Array.isArray(result.requirements)) {
      throw new Error('Invalid requirements structure');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to parse requirements JSON:', response);
    
    // Try to extract and fix the JSON manually
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let fixedJson = jsonMatch[0];
        fixedJson = fixedJson.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        const result = JSON.parse(fixedJson) as RequirementsResult;
        if (result.requirements && Array.isArray(result.requirements)) {
          console.log('Successfully parsed requirements JSON after manual extraction');
          return result;
        }
      }
    } catch (fixError) {
      console.error('Manual JSON extraction also failed:', fixError);
    }
    
    throw new Error(`Failed to parse requirements response: ${error}`);
  }
}
