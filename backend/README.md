r
# Text Processing API

A TypeScript API that processes text content using Google's Gemini AI to generate learning modules and intelligent chunk assignments.

## Features

- **Text Chunking**: Intelligently splits text into optimal chunks with overlap
- **Module Generation**: Uses Gemini AI to create high-level learning modules
- **Smart Assignment**: Assigns text chunks to relevant modules with confidence scores
- **Learning Requirements**: Extracts actionable prerequisites and learning objectives
  - Each requirement now references the related `module_id` and `chunk_id`
- **RESTful API**: Clean Express.js API ready for frontend integration

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file with your Gemini API key:

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Development

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Process Text

```http
POST /api/process
Content-Type: application/json

{
  "text": "Your text content here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chunks": [
      {
        "id": "c-001",
        "text": "First chunk of text..."
      }
    ],
    "modules": {
      "modules": [
        {
          "id": "m1",
          "title": "Module Title",
          "summary": "Module description"
        }
      ]
    },
    "assignments": {
      "assignments": [
        {
          "chunk_id": "c-001",
          "module_id": "m1",
          "confidence": 0.85
        }
      ]
    },
    "requirements": {
      "requirements": [
        {
          "id": "r1",
          "description": "Understand core concepts and terminology",
          "priority": "high",
          "category": "Foundation",
          "module_id": "m1",
          "chunk_id": "c-001"
        },
        {
          "id": "r2", 
          "description": "Practice with real examples",
          "priority": "medium",
          "category": "Application",
          "module_id": "m2",
          "chunk_id": "c-002"
        }
      ]
    }
  },
  "metadata": {
    "textLength": 1500,
    "chunkCount": 5,
    "moduleCount": 8,
    "assignmentCount": 5,
    "requirementCount": 12,
    "processedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Project Structure

```
src/
├── server.ts              # Express server setup
├── services/
│   └── textProcessor.ts   # Main processing orchestration
├── llm/
│   └── gemini.ts         # Gemini AI client
├── pipeline/
│   ├── chunk.ts          # Text chunking logic
│   ├── modules.ts        # Module generation
│   └── assign.ts         # Chunk assignment
├── prompts.ts            # AI prompt templates
└── types.ts              # TypeScript interfaces
```

## Configuration

### Environment Variables

- `LLM_PROVIDER` - `gemini` (default) or `martian`
- `GEMINI_API_KEY` - Your Google Gemini API key (required if LLM_PROVIDER=gemini)
- `MARTIAN_API_KEY` - Your Martian API key (required if LLM_PROVIDER=martian)
- `MARTIAN_BASE_URL` - Override Martian base URL (optional, default: https://api.withmartian.com)
- `LLM_MODEL` - Model name when using Martian (e.g. `google/gemini-2.5-flash`, `openai/gpt-4.1-nano`)
- `PORT` - Server port (default: 3001)

### Text Processing Parameters

- **Chunk Size**: ~200 tokens with 10% overlap
- **Module Count**: 5-10 high-level modules
- **Confidence Threshold**: 0.7-0.95 for assignments

## Error Handling

The API includes comprehensive error handling:

- **400**: Invalid input (missing text, too short, wrong format)
- **500**: Processing errors (API failures, parsing issues)

## Development Scripts

```bash
npm run dev     # Start development server
npm run build   # Build TypeScript
npm run start   # Start production server
```

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **typescript** - Type safety and compilation
- **tsx** - TypeScript execution for development

## Frontend Integration

```javascript
const processText = async (text) => {
  const response = await fetch('http://localhost:3001/api/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text })
  });
  
  return await response.json();
};
```

## Performance Notes

- Text processing time scales with content length
- Gemini API calls may take 2-5 seconds per request
- Recommended text length: 500-50,000 characters
- Maximum recommended: 100,000 characters per request
