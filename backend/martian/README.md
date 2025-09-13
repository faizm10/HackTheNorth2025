# Martian AI Router

A backend-only module for routing AI tasks through Martian's OpenAI-compatible API with intelligent model selection, validation, and repair mechanisms.

## Features

- **Task-based routing**: Different models for different tasks (knowledge check, syllabus mapping, overviews, diagrams, quizzes)
- **Automatic fallbacks**: If preferred models fail, automatically try fallback models
- **Validation & repair**: JSON and Mermaid outputs are validated and automatically repaired if invalid
- **Cost tracking**: Real-time cost estimation and analytics
- **Performance monitoring**: Latency tracking and model performance metrics
- **Mock fallback**: Works offline with mock responses when all models fail

## Quick Start

### 1. Environment Setup

Copy the example environment file and add your Martian API key:

```bash
cp env.example .env
```

Edit `.env`:
```
MARTIAN_API_KEY=your_martian_api_key_here
MARTIAN_BASE_URL=https://api.withmartian.com/v1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Test the API

```bash
# Health check
curl -X GET http://localhost:3000/api/martian/health

# Generate a syllabus map
curl -X POST http://localhost:3000/api/martian/expand \
  -H "Content-Type: application/json" \
  -d '{"topic": "Machine Learning Fundamentals"}'

# Generate an overview
curl -X POST http://localhost:3000/api/martian/overview \
  -H "Content-Type: application/json" \
  -d '{"nodeTitle": "Neural Networks", "scope": "Deep Learning"}'

# Generate a Mermaid diagram
curl -X POST http://localhost:3000/api/martian/diagram \
  -H "Content-Type: application/json" \
  -d '{"nodeTitle": "Data Pipeline", "scope": "ETL Process"}'

# Generate quiz questions
curl -X POST http://localhost:3000/api/martian/quiz \
  -H "Content-Type: application/json" \
  -d '{"nodeTitle": "Linear Regression", "scope": "Statistics"}'
```

## API Endpoints

### POST /api/martian/expand

Generate a structured syllabus map for a topic.

**Request:**
```json
{
  "topic": "Machine Learning Fundamentals",
  "baselineAnswers": ["Previous context", "Additional info"]
}
```

**Response:**
```json
{
  "nodes": [
    {
      "id": "ml-intro",
      "title": "Introduction to Machine Learning",
      "parents": []
    },
    {
      "id": "supervised-learning",
      "title": "Supervised Learning",
      "parents": ["ml-intro"]
    }
  ],
  "meta": {
    "taskType": "syllabus_map",
    "model": "google/gemini-2.5-pro",
    "latency_ms": 1250,
    "tokens_in": 150,
    "tokens_out": 300,
    "cost_est": 0.0015,
    "valid_json": true,
    "repaired": false
  },
  "logged": true
}
```

### POST /api/martian/overview

Generate a concise overview of a topic.

**Request:**
```json
{
  "nodeTitle": "Neural Networks",
  "scope": "Deep Learning"
}
```

**Response:**
```json
{
  "text": "Neural networks are computing systems inspired by biological neural networks...",
  "meta": {
    "taskType": "overview",
    "model": "anthropic/claude-3-5-sonnet-20240620",
    "latency_ms": 800,
    "tokens_in": 100,
    "tokens_out": 200,
    "cost_est": 0.0033
  },
  "logged": true
}
```

### POST /api/martian/diagram

Generate a Mermaid diagram for a topic.

**Request:**
```json
{
  "nodeTitle": "Data Pipeline",
  "scope": "ETL Process"
}
```

**Response:**
```json
{
  "mermaid": "graph TD\n    A[Data Source] --> B[Extract]\n    B --> C[Transform]\n    C --> D[Load]",
  "repaired": false,
  "meta": {
    "taskType": "diagram_mermaid",
    "model": "martian/code",
    "latency_ms": 600,
    "tokens_in": 80,
    "tokens_out": 120,
    "cost_est": 0.0008,
    "valid_json": true,
    "repaired": false
  },
  "logged": true
}
```

### POST /api/martian/quiz

Generate multiple choice quiz questions.

**Request:**
```json
{
  "nodeTitle": "Linear Regression",
  "scope": "Statistics"
}
```

**Response:**
```json
{
  "items": [
    {
      "q": "What is the primary goal of linear regression?",
      "choices": [
        "To classify data into categories",
        "To predict continuous values",
        "To cluster similar data points",
        "To reduce dimensionality"
      ],
      "correctIndex": 1,
      "explanation": "Linear regression is used to predict continuous numerical values based on input features."
    }
  ],
  "meta": {
    "taskType": "quiz_mcq",
    "model": "cohere/command-r-08-2024",
    "latency_ms": 900,
    "tokens_in": 120,
    "tokens_out": 400,
    "cost_est": 0.0012,
    "valid_json": true,
    "repaired": false
  },
  "logged": true
}
```

### GET /api/martian/health

Check API health and connectivity.

**Response:**
```json
{
  "ok": true,
  "models": 6,
  "api_connected": true,
  "timestamp": 1703123456789,
  "version": "0.1"
}
```

## Model Routing Policy

The system uses intelligent routing based on task type:

| Task Type | Preferred Model | Fallback Models |
|-----------|----------------|-----------------|
| `knowledge_check` | google/gemini-2.5-flash | openai/gpt-4.1-nano:cheap, cohere/command-r-08-2024 |
| `syllabus_map` | google/gemini-2.5-pro | openai/gpt-4.1 |
| `overview` | anthropic/claude-3-5-sonnet-20240620 | openai/gpt-4.1, google/gemini-2.5-pro |
| `diagram_mermaid` | martian/code | mistralai/devstral-small |
| `diagram_repair` | martian/code | mistralai/devstral-small |
| `quiz_mcq` | cohere/command-r-08-2024 | openai/gpt-4.1-nano:cheap, google/gemini-2.5-flash |

## Cost Estimation

The system tracks costs using real-time pricing data:

- **Input tokens**: $0.075 - $3.00 per 1M tokens
- **Output tokens**: $0.30 - $15.00 per 1M tokens
- **Baseline comparison**: Uses GPT-4.1 pricing for cost savings analysis

## Analytics & Monitoring

All API calls are logged with metadata:

```typescript
interface AIMeta {
  taskType: string;
  model: string;
  latency_ms: number;
  tokens_in?: number;
  tokens_out?: number;
  cost_est?: number;
  valid_json?: boolean;
  repaired?: boolean;
  timestamp: number;
}
```

Access logs programmatically:

```typescript
import { aiLogger } from './log';

// Get recent logs
const logs = aiLogger.getLogs({ limit: 20 });

// Get analytics summary
const analytics = aiLogger.getAnalytics();
console.log(analytics.avgLatency, analytics.totalCost);
```

## Error Handling

The system implements robust error handling:

1. **Model failures**: Automatically tries fallback models
2. **Validation errors**: Attempts to repair invalid JSON/Mermaid
3. **API timeouts**: Configurable timeout with graceful degradation
4. **Offline mode**: Returns mock responses when all models fail

## Integration Examples

### Next.js API Routes

```typescript
// app/api/martian/expand/route.ts
import { handleExpand } from '../../../backend/martian/handlers/expand';

export async function POST(request: Request) {
  const body = await request.json();
  const result = await handleExpand(body);
  return Response.json(result);
}
```

### Express.js

```typescript
import express from 'express';
import { handleExpand, handleOverview, handleDiagram, handleQuiz, handleHealth } from './backend/martian/handlers';

const app = express();
app.use(express.json());

app.post('/api/martian/expand', async (req, res) => {
  try {
    const result = await handleExpand(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Development

### File Structure

```
/backend/martian/
├── README.md              # This file
├── env.example            # Environment template
├── policy.json            # Model routing configuration
├── cost-map.ts            # Cost estimation
├── prompts.ts             # Task-specific prompts
├── validators.ts          # Output validation
├── client.ts              # Martian API client
├── router.ts              # Main routing logic
├── log.ts                 # Analytics logging
└── handlers/              # HTTP handlers
    ├── expand.ts          # Syllabus map generation
    ├── overview.ts        # Overview generation
    ├── diagram.ts         # Mermaid diagram generation
    ├── quiz.ts            # Quiz generation
    └── health.ts          # Health check
```

### Adding New Task Types

1. Add route to `policy.json`
2. Create prompt builder in `prompts.ts`
3. Add validator in `validators.ts` (if needed)
4. Create handler in `handlers/`
5. Update documentation

### Testing

```bash
# Run health check
npm test -- --grep "health"

# Test all endpoints
npm test
```

## License

MIT License - see LICENSE file for details.
