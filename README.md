# HackTheNorth 2025 - AI Learning Platform

A smart learning platform that helps you study by turning any text or document into organized learning modules using AI.

## What This Does

This app takes your study materials (text, PDFs, documents) and automatically:
- Breaks them into easy-to-understand chunks
- Creates learning modules and study guides
- Tracks your progress
- Generates quizzes and practice sessions
- Helps you learn step by step

## How to Use

### 1. Start the Backend (API Server)

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Start the Frontend (Web App)

```bash
cd frontend
npm install
npm run dev
```

The web app will open at `http://localhost:5173`

### 3. Use the App

1. **Upload Files**: Upload PDFs, Word docs, or any text files
2. **Paste Text**: Or just paste text directly into the text area
3. **Get AI Processing**: The app uses Google's Gemini AI to analyze your content
4. **Study Smart**: Get organized modules, requirements, and study guides
5. **Track Progress**: See how well you're doing with visual progress bars

## What You Need

- Node.js (version 18 or higher)
- A Google Gemini API key (get one from Google AI Studio)
- Create a `.env` file in the `backend` folder with:
  ```
  GEMINI_API_KEY=your_api_key_here
  ```

## Project Structure

```
├── backend/          # API server that processes text with AI
├── frontend/         # React web app with learning dashboard
├── archived/         # Old versions of components
└── testing/          # Test files and examples
```

## Main Features

- **File Upload**: Upload PDFs, Word docs, and other documents
- **Text Processing**: AI breaks down complex text into learning chunks
- **Study Guides**: Automatically generated study plans
- **Progress Tracking**: Visual progress bars and mastery levels
- **Quiz Generation**: AI creates practice questions
- **Chat Tutor**: Ask questions about your study material

## Tech Used

- **Frontend**: React + TypeScript + Vite + Ant Design
- **Backend**: Node.js + Express + TypeScript
- **AI**: Google Gemini API
- **File Processing**: PDF parsing, document extraction

## Quick Test

1. Start both servers (backend and frontend)
2. Go to the web app
3. Paste some text about any topic (like machine learning, history, science)
4. Click "Process Text"
5. Watch as AI creates organized learning modules for you!

## Need Help?

Check the individual README files in the `backend` and `frontend` folders for more detailed setup instructions.
