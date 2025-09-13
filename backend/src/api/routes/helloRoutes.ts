import { Router } from "express";
import { hello, health, helloName } from "../controllers/helloController.js";

const router = Router();

router.get("/", hello);
router.get("/health", health);
router.get("/:name", helloName);

export default router;
