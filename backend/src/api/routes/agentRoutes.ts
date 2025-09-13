import { Router } from "express";
import {
  getInitialResponse,
  getResponse,
} from "../controllers/agentController.js";

const router = Router();

router.post("/response", getResponse);
router.post("/initial-response", getInitialResponse);

export default router;
