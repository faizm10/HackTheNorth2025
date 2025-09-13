export function getModulesPrompt(sample: string, max: number = 12): string {
  return `Analyze this text and create high-level learning modules that group related concepts together. Each module should represent a major topic area, not individual subtopics.

Text excerpt:
${sample}

Instructions:
- Create 5-10 broad, distinct learning modules that group related content
- Each module should cover a complete topic area, not individual components
- Avoid creating separate modules for subtopics that belong together
- Focus on major themes and comprehensive subject areas
- Each module title should be broad enough to encompass related concepts

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "modules": [
    {"id": "m1", "title": "Broad Topic Area", "summary": "Comprehensive description covering all related concepts"},
    {"id": "m2", "title": "Another Major Topic", "summary": "Description of the complete subject area"}
  ]
}

Important: Return ONLY the JSON object. No markdown formatting, no code blocks, no extra text. Create ${max} or fewer high-level modules that group related content together.`;
}

export function assignChunkPrompt(chunk: string, modulesJson: string): string {
  return `Analyze this passage and assign it to the most appropriate module based on the main topic and content.

Available modules:
${modulesJson}

Passage to analyze:
${chunk}

Instructions:
- Choose the module that best matches the PRIMARY topic of this passage
- Consider the main theme, not minor details or examples
- If the passage covers multiple topics, choose the dominant one
- Only use "none" if the passage doesn't fit any module well (confidence 0.1-0.3)
- Be confident (0.7-0.95) when there's a clear match

Return only valid JSON with this exact structure:
{"module_id": "m1", "confidence": 0.85}`;
}
