const { Router } = require("express");
const {
  hello,
  health,
  helloName,
} = require("../controllers/helloController.js");

const router = Router();

/**
 * Hello World Routes
 * Base path: /api/hello
 */

// GET /api/hello - Basic hello world
router.get("/", hello);

// GET /api/hello/health - Health check
router.get("/health", health);

// GET /api/hello/:name - Personalized hello
router.get("/:name", helloName);

module.exports = router;
