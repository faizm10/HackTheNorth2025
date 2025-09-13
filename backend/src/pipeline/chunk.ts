import { Chunk } from '../types.js';

// Rough estimation: ~4 characters per token for English text
const CHARS_PER_TOKEN = 4;
const TARGET_TOKENS = 200; // Target chunk size
const OVERLAP_PERCENT = 0.1; // 10% overlap

export function chunkText(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  const targetChars = TARGET_TOKENS * CHARS_PER_TOKEN;
  const overlapChars = Math.floor(targetChars * OVERLAP_PERCENT);
  
  let start = 0;
  let chunkIndex = 1;
  
  while (start < text.length) {
    let end = start + targetChars;
    
    // Try to break at sentence boundary
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('.', end);
      const paragraphEnd = text.lastIndexOf('\n\n', end);
      
      if (paragraphEnd > start + targetChars * 0.5) {
        end = paragraphEnd;
      } else if (sentenceEnd > start + targetChars * 0.5) {
        end = sentenceEnd + 1;
      }
    }
    
    const chunkText = text.slice(start, end).trim();
    if (chunkText.length > 0) {
      chunks.push({
        id: `c-${chunkIndex.toString().padStart(3, '0')}`,
        text: chunkText
      });
      chunkIndex++;
    }
    
    // Move start position with overlap
    start = end - overlapChars;
    if (start >= end) start = end;
  }
  
  return chunks;
}
