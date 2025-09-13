import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processText } from './services/textProcessor.js';
import { exit } from 'process';
import { getSupabase } from './services/supabaseClient.js';

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

// Store processed result to Supabase
app.post('/api/results', async (req, res) => {
  try {
    const { id, success, data, metadata } = req.body || {};

    // Allow client-provided id or generate one
    const recordId = typeof id === 'string' && id.trim().length > 0 ? id : `res_${Date.now()}`;

    if (typeof success !== 'boolean' || !data || !metadata) {
      return res.status(400).json({ error: 'Invalid body: require success:boolean, data:object, metadata:object' });
    }

    let supabase;
    try {
      supabase = getSupabase();
    } catch (cfgErr: any) {
      return res.status(500).json({ error: 'Supabase not configured', message: cfgErr?.message });
    }
    const { error } = await supabase
      .from('processed_results')
      .insert([{ id: recordId, success, data, metadata }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store result', details: error.message });
    }

    return res.json({ success: true, id: recordId });
  } catch (e: any) {
    console.error('Store results error:', e);
    const message = e?.message || 'Internal server error';
    return res.status(500).json({ error: 'Internal server error', message });
  }
});

// Retrieve processed result(s) from Supabase
app.get('/api/results/:id?', async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      let supabase;
      try {
        supabase = getSupabase();
      } catch (cfgErr: any) {
        return res.status(500).json({ error: 'Supabase not configured', message: cfgErr?.message });
      }
      const { data, error } = await supabase
        .from('processed_results')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
        console.error('Supabase fetch by id error:', error);
        return res.status(500).json({ error: 'Failed to fetch result', details: error.message });
      }
      return res.json({ success: true, data });
    } else {
      let supabase;
      try {
        supabase = getSupabase();
      } catch (cfgErr: any) {
        return res.status(500).json({ error: 'Supabase not configured', message: cfgErr?.message });
      }
      const { data, error } = await supabase
        .from('processed_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        console.error('Supabase list error:', error);
        return res.status(500).json({ error: 'Failed to list results', details: error.message });
      }
      return res.json({ success: true, data });
    }
  } catch (e: any) {
    console.error('Get results error:', e);
    const message = e?.message || 'Internal server error';
    return res.status(500).json({ error: 'Internal server error', message });
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

