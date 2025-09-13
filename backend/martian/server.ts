/**
 * Example Express server demonstrating Martian AI routing
 * This is a reference implementation - integrate handlers into your existing server
 */

import express from 'express';
import cors from 'cors';
import { handleExpand } from './handlers/expand';
import { handleOverview } from './handlers/overview';
import { handleDiagram } from './handlers/diagram';
import { handleQuiz } from './handlers/quiz';
import { handleHealth } from './handlers/health';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/martian/health', async (req, res) => {
  try {
    const result = await handleHealth();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Syllabus map expansion
app.post('/api/martian/expand', async (req, res) => {
  try {
    const result = await handleExpand(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Overview generation
app.post('/api/martian/overview', async (req, res) => {
  try {
    const result = await handleOverview(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Mermaid diagram generation
app.post('/api/martian/diagram', async (req, res) => {
  try {
    const result = await handleDiagram(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Quiz generation
app.post('/api/martian/quiz', async (req, res) => {
  try {
    const result = await handleQuiz(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Martian AI Router API',
    version: '1.0.0',
    endpoints: [
      'GET /api/martian/health',
      'POST /api/martian/expand',
      'POST /api/martian/overview',
      'POST /api/martian/diagram',
      'POST /api/martian/quiz'
    ]
  });
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Martian AI Router running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/martian/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
});

export default app;
