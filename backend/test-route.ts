import 'dotenv/config';
import { classifyTask } from './src/routing/classifyTask.ts';
import { routeAndCall } from './src/routing/router.ts';

(async () => {
  const prompt = "Create a mind map of topics (syllabus) for a course on distributed systems. Return compact JSON per schema.";
  const task = classifyTask({ prompt });
  const res = await routeAndCall(task, prompt, {
    requireJson: true,
    schemaName: 'modules',
    tokensInEstimate: Math.ceil(prompt.length/4),
  });
  console.log(JSON.stringify({ task, modelUsed: res.modelUsed, latencyMs: res.latencyMs, ok: !!res.validated }, null, 2));
  console.log(res.text);
})();
