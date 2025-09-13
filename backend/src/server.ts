import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processText } from './services/textProcessor.js';
import { exit } from 'process';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main text processing endpoint
app.post('/api/process', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input: text is required and must be a string' 
      });
    }

    if (text.length < 100) {
      return res.status(400).json({ 
        error: 'Text must be at least 100 characters long' 
      });
    }

    console.log(`Processing text: ${text.length} characters`);
    
    const result = await processText(text);
    
    res.json({
      success: true,
      data: result,
      metadata: {
        textLength: text.length,
        chunkCount: result.chunks.length,
        moduleCount: result.modules.modules.length,
        assignmentCount: result.assignments.assignments.length,
        requirementCount: result.requirements.requirements.length,
        processedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      error: 'Internal server error during text processing',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/api/process`);
//   exit(0);
});

