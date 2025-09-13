/**
 * Basic hello world endpoint
 */
const hello = (req, res) => {
  res.status(200).json({
    message: "Hello World!",
    timestamp: new Date().toISOString(),
    success: true,
  });
};

/**
 * Personalized hello endpoint
 */
const helloName = (req, res) => {
  const { name } = req.params;

  if (!name) {
    return res.status(400).json({
      message: "Name parameter is required",
      success: false,
    });
  }

  res.status(200).json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    success: true,
  });
};

/**
 * Health check endpoint
 */
const health = (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "API is running successfully",
    timestamp: new Date().toISOString(),
    success: true,
  });
};

module.exports = {
  hello,
  helloName,
  health,
};
