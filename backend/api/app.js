const express = require("express");
const cors = require("cors");
const helloRoutes = require("./routes/helloRoutes.js");
const agentRoutes = require("./routes/agentRoutes.js");

/**
 * Express App Configuration
 */
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api/hello", helloRoutes);
app.use("/api/agent", agentRoutes);

// Default route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World API Server",
    version: "1.0.0",
    endpoints: [
      "GET / - This message",
      "GET /api/hello - Hello world message",
      "GET /api/hello/health - Health check",
      "GET /api/hello/:name - Personalized hello",
      "GET /api/agent/response",
    ],
    timestamp: new Date().toISOString(),
    success: true,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    success: false,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Internal server error",
    timestamp: new Date().toISOString(),
    success: false,
  });
});

module.exports = app;
