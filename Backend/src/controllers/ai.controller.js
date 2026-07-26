import {
  buildConversationContext,
  buildMessageContext,
  contextToPromptText,
  getLastIncomingMessage,
} from "../services/contextBuilder.service.js";
import { complete, streamComplete } from "../services/llm.service.js";
import {
  SUMMARIZE_SYSTEM_PROMPT,
  buildSummarizeUserPrompt,
  SUGGEST_REPLY_SYSTEM_PROMPT,
  buildSuggestReplyUserPrompt,
  TRANSLATE_SYSTEM_PROMPT,
  buildTranslateUserPrompt,
  EXPLAIN_CODE_SYSTEM_PROMPT,
  buildExplainCodeUserPrompt,
} from "../services/promptTemplates.js";
import { parseJsonFromLLM, normalizeSuggestions } from "../utils/parseJsonFromLLM.js";

const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
  pt: "Portuguese",
  ar: "Arabic",
  zh: "Chinese (Simplified)",
};

const validatePartnerRequest = (req, res) => {
  const { partnerId } = req.body;
  const userId = req.user._id;

  if (!partnerId) {
    res.status(400).json({ message: "partnerId is required" });
    return null;
  }

  if (partnerId === userId.toString()) {
    res.status(400).json({ message: "Cannot use AI on a chat with yourself" });
    return null;
  }

  return { partnerId, userId };
};

const handleAIError = (error, res, fallbackMessage = "AI request failed") => {
  console.error("Error in AI controller:", error.message);

  if (error.message === "Partner not found") {
    return res.status(404).json({ message: "Chat partner not found" });
  }
  if (error.message === "Message not found") {
    return res.status(404).json({ message: "Message not found" });
  }
  if (error.message === "Invalid partner ID" || error.message === "Invalid message ID") {
    return res.status(400).json({ message: error.message });
  }
  if (error.message === "GROQ_API_KEY is not configured") {
    return res.status(503).json({ message: "AI service is not configured" });
  }

  return res.status(500).json({ message: fallbackMessage });
};

export const summarizeConversation = async (req, res) => {
  try {
    const validated = validatePartnerRequest(req, res);
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
    return handleAIError(error, res, "Failed to generate summary");
  }
};

export const summarizeConversationStream = async (req, res) => {
  const validated = validatePartnerRequest(req, res);
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

export const suggestReply = async (req, res) => {
  try {
    const validated = validatePartnerRequest(req, res);
    if (!validated) return;

    const { partnerId, userId } = validated;
    const context = await buildConversationContext(userId, partnerId);

    if (context.messageCount === 0) {
      return res.status(200).json({
        suggestions: [
          "Hey! How are you doing?",
          "Hi there! What's up?",
          "Hello! Hope you're having a great day!",
        ],
        partner: context.partner,
        messageCount: 0,
      });
    }

    const conversationText = contextToPromptText(context);
    const lastIncoming = getLastIncomingMessage(context);
    const userPrompt = buildSuggestReplyUserPrompt(context, conversationText, lastIncoming);

    const result = await complete({
      systemPrompt: SUGGEST_REPLY_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.7,
    });

    let suggestions;
    try {
      const parsed = parseJsonFromLLM(result.text);
      suggestions = normalizeSuggestions(parsed);
    } catch (parseError) {
      console.warn("JSON parse failed, using line-split fallback:", parseError.message);
      suggestions = result.text
        .split("\n")
        .map((line) => line.replace(/^[\d\-*•.)]+\s*/, "").replace(/^["']|["']$/g, "").trim())
        .filter((line) => line.length > 0 && !line.startsWith("{") && !line.startsWith("["))
        .slice(0, 3);

      if (suggestions.length === 0) {
        throw new Error("Could not extract suggestions from LLM response");
      }
    }

    while (suggestions.length < 3) {
      suggestions.push(suggestions[suggestions.length - 1]);
    }

    return res.status(200).json({
      suggestions: suggestions.slice(0, 3),
      partner: context.partner,
      messageCount: context.messageCount,
      lastIncomingMessage: lastIncoming?.text || null,
      model: result.model,
    });
  } catch (error) {
    return handleAIError(error, res, "Failed to generate reply suggestions");
  }
};

export const translateMessage = async (req, res) => {
  try {
    const validated = validatePartnerRequest(req, res);
    if (!validated) return;

    const { partnerId, userId } = validated;
    const { messageId, targetLanguage } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "messageId is required" });
    }
    if (!targetLanguage) {
      return res.status(400).json({ message: "targetLanguage is required" });
    }

    const languageName = SUPPORTED_LANGUAGES[targetLanguage.toLowerCase()] || targetLanguage;

    const context = await buildMessageContext(userId, partnerId, messageId);
    const messageText = context.message.text;

    if (!messageText || messageText === "[empty message]") {
      return res.status(400).json({ message: "Message has no text to translate" });
    }

    const userPrompt = buildTranslateUserPrompt(messageText, languageName);

    const result = await complete({
      systemPrompt: TRANSLATE_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
    });

    return res.status(200).json({
      translation: result.text,
      originalText: messageText,
      targetLanguage: targetLanguage.toLowerCase(),
      targetLanguageName: languageName,
      messageId,
      model: result.model,
    });
  } catch (error) {
    return handleAIError(error, res, "Failed to translate message");
  }
};

export const explainCode = async (req, res) => {
  try {
    const validated = validatePartnerRequest(req, res);
    if (!validated) return;

    const { partnerId, userId } = validated;
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "messageId is required" });
    }

    const context = await buildMessageContext(userId, partnerId, messageId);
    const messageText = context.message.text;

    if (!messageText || messageText === "[empty message]") {
      return res.status(400).json({ message: "Message has no text to explain" });
    }

    const userPrompt = buildExplainCodeUserPrompt(messageText, context.message.senderName);

    const result = await complete({
      systemPrompt: EXPLAIN_CODE_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
    });

    return res.status(200).json({
      explanation: result.text,
      messageId,
      originalText: messageText,
      model: result.model,
    });
  } catch (error) {
    return handleAIError(error, res, "Failed to explain code");
  }
};

export const explainCodeStream = async (req, res) => {
  const validated = validatePartnerRequest(req, res);
  if (!validated) return;

  const { partnerId, userId } = validated;
  const { messageId } = req.body;

  if (!messageId) {
    return res.status(400).json({ message: "messageId is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const context = await buildMessageContext(userId, partnerId, messageId);
    const messageText = context.message.text;

    sendEvent({
      type: "meta",
      messageId,
      originalText: messageText,
    });

    if (!messageText || messageText === "[empty message]") {
      sendEvent({ type: "chunk", text: "Message has no text to explain." });
      sendEvent({ type: "done" });
      return res.end();
    }

    const userPrompt = buildExplainCodeUserPrompt(messageText, context.message.senderName);

    await streamComplete({
      systemPrompt: EXPLAIN_CODE_SYSTEM_PROMPT,
      userPrompt,
      onChunk: (delta) => {
        sendEvent({ type: "chunk", text: delta });
      },
    });

    sendEvent({ type: "done" });
    res.end();
  } catch (error) {
    console.error("Error in explainCodeStream:", error.message);

    const message =
      error.message === "Message not found"
        ? "Message not found"
        : error.message === "GROQ_API_KEY is not configured"
          ? "AI service is not configured"
          : "Failed to explain code";

    sendEvent({ type: "error", message });
    res.end();
  }
};

export const translateMessageStream = async (req, res) => {
  const validated = validatePartnerRequest(req, res);
  if (!validated) return;

  const { partnerId, userId } = validated;
  const { messageId, targetLanguage } = req.body;

  if (!messageId) {
    return res.status(400).json({ message: "messageId is required" });
  }
  if (!targetLanguage) {
    return res.status(400).json({ message: "targetLanguage is required" });
  }

  const languageName = SUPPORTED_LANGUAGES[targetLanguage.toLowerCase()] || targetLanguage;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const context = await buildMessageContext(userId, partnerId, messageId);
    const messageText = context.message.text;

    sendEvent({
      type: "meta",
      messageId,
      originalText: messageText,
      targetLanguage: targetLanguage.toLowerCase(),
      targetLanguageName: languageName,
    });

    if (!messageText || messageText === "[empty message]") {
      sendEvent({ type: "chunk", text: "Message has no text to translate." });
      sendEvent({ type: "done" });
      return res.end();
    }

    const userPrompt = buildTranslateUserPrompt(messageText, languageName);

    await streamComplete({
      systemPrompt: TRANSLATE_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
      onChunk: (delta) => {
        sendEvent({ type: "chunk", text: delta });
      },
    });

    sendEvent({ type: "done" });
    res.end();
  } catch (error) {
    console.error("Error in translateMessageStream:", error.message);

    const message =
      error.message === "Message not found"
        ? "Message not found"
        : error.message === "GROQ_API_KEY is not configured"
          ? "AI service is not configured"
          : "Failed to translate message";

    sendEvent({ type: "error", message });
    res.end();
  }
};
