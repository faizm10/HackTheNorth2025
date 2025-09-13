import { chunkText } from '../pipeline/chunk.js';
import { runModules } from '../pipeline/modules.js';
import { runAssignments } from '../pipeline/assign.js';
import { extractChunkRequirements } from '../pipeline/requirements.js';
import { Chunk, ModulesResult, AssignmentsResult, RequirementsResult, Requirement } from '../types.js';

export interface ProcessingResult {
  chunks: Chunk[];
  modules: ModulesResult;
  assignments: AssignmentsResult;
  requirements: RequirementsResult;
}

/**
 * Main text processing function that orchestrates the entire pipeline
 * @param text - The input text to process
 * @returns ProcessingResult with chunks, modules, and assignments
 */
export async function processText(text: string): Promise<ProcessingResult> {
  console.log('🚀 Starting text processing pipeline...');
  
  // 1. Chunk the text
  console.log('✂️  Chunking text...');
  const chunks = chunkText(text);
  console.log(`   Created ${chunks.length} chunks`);
  
  // 2. Generate modules
  console.log('🧠 Generating modules...');
  const modules = await runModules(text);
  console.log(`   Generated ${modules.modules.length} modules`);
  
  // 3. Assign chunks to modules
  console.log('🎯 Assigning chunks to modules...');
  const assignments = await runAssignments(chunks, modules);
  console.log(`   Completed ${assignments.length} assignments`);
  
  // 4. Extract requirements per chunk/module assignment
  console.log('📋 Extracting requirements...');
  const requirementsList: Requirement[] = [];
  for (const a of assignments) {
    if (!a.module_id || a.module_id === 'none') continue;
    const chunk = chunks.find(c => c.id === a.chunk_id);
    if (!chunk) continue;
    const module = modules.modules.find(m => m.id === a.module_id);
    const moduleTitle = module ? module.title : 'Unassigned';
    const reqs = await extractChunkRequirements(a.chunk_id, chunk.text, a.module_id, moduleTitle);
    requirementsList.push(...reqs);
  }
  const requirements: RequirementsResult = { requirements: requirementsList };
  console.log(`   Extracted ${requirements.requirements.length} requirements`);
  
  const result: ProcessingResult = {
    chunks,
    modules,
    assignments: { assignments },
    requirements
  };
  
  console.log('✅ Pipeline completed successfully!');
  return result;
}
