const { Router } = require("express");
const {
  getInitialResponse,
  generateQuiz,
  getResponse,
} = require("../controllers/agentController.js");

const router = Router();

router.post("/response", getResponse);
router.post("/initial-response", getInitialResponse);

module.exports = router;

// Example: How to call the /api/agent/response endpoint using curl
// Run this in your terminal (replace localhost:3001 if needed):

// # Example: How to call the /api/agent/response endpoint using PowerShell's Invoke-WebRequest
// # Run this in your PowerShell terminal (replace localhost:3001 if needed):

// Invoke-WebRequest -Uri "http://localhost:3001/api/agent/response" `
//   -Method POST `
//   -Headers @{ "Content-Type" = "application/json" } `
//   -Body '{
//     "messages": [
//       {"role": "user", "content": "Hello, how are you?"}
//     ]
//   }'
