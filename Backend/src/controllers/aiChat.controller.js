import { complete } from "../services/llm.service.js";

export const chatAssistant = async (req, res) => {
  try {
    const question = req.body.question?.trim();
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-8) : [];
    if (!question) return res.status(400).json({ message: "question is required" });
    if (question.length > 2000) return res.status(400).json({ message: "question must be 2000 characters or fewer" });

    const previousChat = history
      .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
      .map((item) => `${item.role === "user" ? "User" : "Assistant"}: ${item.content.slice(0, 2000)}`)
      .join("\n");
    const result = await complete({
      systemPrompt: "You are a helpful AI assistant inside a messaging app. Answer clearly and safely. Keep answers concise unless the user asks for detail.",
      userPrompt: `${previousChat ? `Previous chat:\n${previousChat}\n\n` : ""}User: ${question}`,
      temperature: 0.5,
    });
    res.json({ answer: result.text.trim(), model: result.model });
  } catch (error) {
    console.error("Assistant chat failed:", error.message);
    res.status(500).json({ message: "Failed to get an AI response" });
  }
};
