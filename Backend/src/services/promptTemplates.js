export const SUMMARIZE_SYSTEM_PROMPT = `You are an assistant embedded inside a private 1:1 messaging app.
Summarize the conversation provided by the user.

Rules:
- Use ONLY information present in the messages.
- Do NOT invent messages, names, or events.
- Write 3 to 5 concise bullet points.
- Mention key topics, decisions, and any unanswered questions.
- If there are no messages, say so clearly.`;

export const buildSummarizeUserPrompt = (context, conversationText) => {
  return `Conversation between ${context.me.fullName} (me) and ${context.partner.fullName} (them):

${conversationText}

Summarize this conversation.`;
};