# Hello World Express API

A simple Express.js API with TypeScript that provides hello world endpoints.

## Structure

```
backend/api/
├── controllers/
│   └── helloController.ts    # Controller with business logic
├── routes/
│   └── helloRoutes.ts       # Route definitions
├── app.ts                   # Express app configuration
├── server.ts               # Server startup file
└── README.md               # This file
```

## Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

## Running the API

### Development mode (with auto-restart)

```bash
npm run api:dev
```

### Production mode

```bash
npm run api:start
```

The server will start on port 3001 by default. You can change this by setting the `PORT` environment variable.

## Available Endpoints

| Method | Endpoint            | Description                             |
| ------ | ------------------- | --------------------------------------- |
| GET    | `/`                 | API information and available endpoints |
| GET    | `/api/hello`        | Basic hello world message               |
| GET    | `/api/hello/health` | Health check endpoint                   |
| GET    | `/api/hello/:name`  | Personalized hello message              |

## Example Requests

### Basic Hello World

```bash
curl http://localhost:3001/api/hello
```

Response:

```json
{
  "message": "Hello World!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "success": true
}
```

### Personalized Hello

```bash
curl http://localhost:3001/api/hello/John
```

Response:

```json
{
  "message": "Hello, John!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "success": true
}
```

### Health Check

```bash
curl http://localhost:3001/api/hello/health
```

Response:

```json
{
  "status": "healthy",
  "message": "API is running successfully",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "success": true
}
```

## Features

- ✅ TypeScript support
- ✅ CORS enabled
- ✅ JSON body parsing
- ✅ Error handling
- ✅ 404 route handling
- ✅ Graceful shutdown
- ✅ Health check endpoint
- ✅ Development hot-reload with nodemon
