const app = require("./app.js");

const PORT = process.env.PORT || 3001;

/**
 * Start the Express server
 */
const server = app.listen(PORT, () => {
  console.log(`🚀 Hello World API Server is running on port ${PORT}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🌍 Available endpoints:`);
  console.log(`   GET http://localhost:${PORT}/ - API info`);
  console.log(`   GET http://localhost:${PORT}/api/hello - Hello world`);
  console.log(
    `   GET http://localhost:${PORT}/api/hello/health - Health check`
  );
  console.log(
    `   GET http://localhost:${PORT}/api/hello/:name - Personalized hello`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📟 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("💤 Server closed successfully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("📟 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("💤 Server closed successfully");
    process.exit(0);
  });
});

module.exports = server;
