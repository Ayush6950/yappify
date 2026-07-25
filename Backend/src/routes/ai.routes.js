import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  summarizeConversation,
  summarizeConversationStream,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/summarize", summarizeConversation);
router.post("/summarize/stream", summarizeConversationStream);

export default router;