import { Router } from "express";
import { gradeSubmission } from "../controllers/agentController.js";

const router = Router();

router.post("/grade", gradeSubmission);

export default router;
