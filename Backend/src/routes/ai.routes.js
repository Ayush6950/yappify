import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { chatAssistant } from "../controllers/aiChat.controller.js";
import {
  summarizeConversation,
  summarizeConversationStream,
  suggestReply,
  translateMessage,
  translateMessageStream,
  explainCode,
  explainCodeStream,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/summarize", summarizeConversation);
router.post("/summarize/stream", summarizeConversationStream);
router.post("/suggest-reply", suggestReply);
router.post("/chat", chatAssistant);
router.post("/translate", translateMessage);
router.post("/translate/stream", translateMessageStream);
router.post("/explain-code", explainCode);
router.post("/explain-code/stream", explainCodeStream);
export default router;
