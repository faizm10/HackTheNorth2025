import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { chunkText } from './pipeline/chunk.js';
import { runModules } from './pipeline/modules.js';
import { runAssignments } from './pipeline/assign.js';

async function main() {
  try {
    console.log('🚀 Starting text processing pipeline...\n');
    
    // 1. Read input text
    console.log('📖 Reading input text...');
    const inputPath = join(process.cwd(), 'data', 'input.txt');
    const text = readFileSync(inputPath, 'utf-8');
    console.log(`   Read ${text.length} characters\n`);
    
    // 2. Chunk text
    console.log('✂️  Chunking text...');
    const chunks = chunkText(text);
    console.log(`   Created ${chunks.length} chunks\n`);
    
    // 3. Generate modules
    console.log('🧠 Generating modules...');
    const modulesResult = await runModules(text);
    console.log(`   Generated ${modulesResult.modules.length} modules\n`);
    
    // 4. Assign chunks to modules
    console.log('🎯 Assigning chunks to modules...');
    const assignments = await runAssignments(chunks, modulesResult);
    console.log(`   Completed ${assignments.length} assignments\n`);
    
    // 5. Write outputs
    console.log('💾 Writing output files...');
    const outputDir = join(process.cwd(), 'output');
    
    writeFileSync(
      join(outputDir, 'modules.json'), 
      JSON.stringify(modulesResult, null, 2)
    );
    
    writeFileSync(
      join(outputDir, 'assignments.json'), 
      JSON.stringify({ assignments }, null, 2)
    );
    
    // 6. Log summary
    const noneCount = assignments.filter(a => a.module_id === 'none').length;
    const nonePercent = ((noneCount / assignments.length) * 100).toFixed(1);
    
    console.log('✅ Pipeline completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Modules: ${modulesResult.modules.length}`);
    console.log(`   Chunks: ${chunks.length}`);
    console.log(`   Unassigned: ${noneCount} (${nonePercent}%)`);
    console.log(`   Output: ./output/modules.json, ./output/assignments.json`);
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    process.exit(1);
  }
}

main();
