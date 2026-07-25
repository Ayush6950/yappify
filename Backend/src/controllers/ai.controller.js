import {
  buildConversationContext,
  contextToPromptText,
} from "../services/contextBuilder.service.js";
import { complete, streamComplete } from "../services/llm.service.js";
import {
  SUMMARIZE_SYSTEM_PROMPT,
  buildSummarizeUserPrompt,
} from "../services/promptTemplates.js";

const validateSummarizeRequest = (req, res) => {
  const { partnerId } = req.body;
  const userId = req.user._id;

  if (!partnerId) {
    res.status(400).json({ message: "partnerId is required" });
    return null;
  }

  if (partnerId === userId.toString()) {
    res.status(400).json({ message: "Cannot summarize a chat with yourself" });
    return null;
  }

  return { partnerId, userId };
};

const handleAIError = (error, res) => {
  console.error("Error in AI controller:", error.message);

  if (error.message === "Partner not found") {
    return res.status(404).json({ message: "Chat partner not found" });
  }
  if (error.message === "Invalid partner ID") {
    return res.status(400).json({ message: "Invalid partner ID" });
  }
  if (error.message === "GROQ_API_KEY is not configured") {
    return res.status(503).json({ message: "AI service is not configured" });
  }

  return res.status(500).json({ message: "Failed to generate summary" });
};

export const summarizeConversation = async (req, res) => {
  try {
    const validated = validateSummarizeRequest(req, res);
    if (!validated) return;

    const { partnerId, userId } = validated;
    const context = await buildConversationContext(userId, partnerId);

    if (context.messageCount === 0) {
      return res.status(200).json({
        summary: "No messages in this conversation yet.",
        partner: context.partner,
        messageCount: 0,
      });
    }

    const conversationText = contextToPromptText(context);
    const userPrompt = buildSummarizeUserPrompt(context, conversationText);

    const result = await complete({
      systemPrompt: SUMMARIZE_SYSTEM_PROMPT,
      userPrompt,
    });

    return res.status(200).json({
      summary: result.text,
      partner: context.partner,
      messageCount: context.messageCount,
      model: result.model,
    });
  } catch (error) {
    return handleAIError(error, res);
  }
};

export const summarizeConversationStream = async (req, res) => {
  const validated = validateSummarizeRequest(req, res);
  if (!validated) return;

  const { partnerId, userId } = validated;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const context = await buildConversationContext(userId, partnerId);

    sendEvent({
      type: "meta",
      partner: context.partner,
      messageCount: context.messageCount,
    });

    if (context.messageCount === 0) {
      sendEvent({ type: "chunk", text: "No messages in this conversation yet." });
      sendEvent({ type: "done" });
      return res.end();
    }

    const conversationText = contextToPromptText(context);
    const userPrompt = buildSummarizeUserPrompt(context, conversationText);

    await streamComplete({
      systemPrompt: SUMMARIZE_SYSTEM_PROMPT,
      userPrompt,
      onChunk: (delta) => {
        sendEvent({ type: "chunk", text: delta });
      },
    });

    sendEvent({ type: "done" });
    res.end();
  } catch (error) {
    console.error("Error in summarizeConversationStream:", error.message);

    const message =
      error.message === "Partner not found"
        ? "Chat partner not found"
        : error.message === "Invalid partner ID"
          ? "Invalid partner ID"
          : error.message === "GROQ_API_KEY is not configured"
            ? "AI service is not configured"
            : "Failed to generate summary";

    sendEvent({ type: "error", message });
    res.end();
  }
};
