# API Testing Interface

This folder contains a simple HTML interface to test the Text Processing API.

## Quick Start

1. **Start the backend server:**
   ```bash
   cd /Applications/vscode/HackTheNorth2025/backend
   npm run dev
   ```

2. **Open the test interface:**
   - Open `test.html` in your web browser
   - Or serve it locally: `python -m http.server 8000` then visit `http://localhost:8000/test.html`

3. **Test the API:**
   - The interface comes with sample machine learning text pre-loaded
   - Click "🔧 Process Text" to test the API
   - View results in organized sections: modules, requirements, chunks, assignments

## Features

- **Visual Results Display**: Clean, organized view of all API responses
- **Statistics Dashboard**: Quick overview of processing results
- **Priority Color Coding**: Requirements are color-coded by priority (high/medium/low)
- **Raw JSON View**: Full API response for debugging
- **Error Handling**: Clear error messages if API is unavailable

## What You'll See

### 📊 Statistics
- Character count
- Number of chunks created
- Number of modules generated
- Number of assignments made
- Number of requirements extracted

### 📚 Learning Modules
- High-level topics extracted from your text
- Each with title and comprehensive summary

### 📋 Learning Requirements
- Actionable prerequisites users must fulfill
- Color-coded by priority (red=high, yellow=medium, green=low)
- Organized by category (Knowledge Area, Skill Area, etc.)

### 📄 Text Chunks
- How your text was intelligently split
- Each chunk with unique ID

### 🔗 Chunk Assignments
- Which content belongs to which module
- Confidence scores for each assignment

## Testing Different Content

Try pasting different types of content:
- Technical documentation
- Educational materials
- Business requirements
- Process descriptions
- Any structured text content

The AI will automatically extract relevant learning modules and requirements based on the content!
