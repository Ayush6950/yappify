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

export const SUGGEST_REPLY_SYSTEM_PROMPT = `You are an assistant embedded inside a private 1:1 messaging app.
Suggest 3 short reply options the user could send next.

Rules:
- Match the tone and formality of the conversation (casual, professional, etc.).
- Focus primarily on responding to the LAST incoming message from the partner.
- Use conversation history for context but prioritize the most recent partner message.
- Each suggestion must be a complete, sendable message (1-2 sentences max).
- Do NOT include explanations, labels, or numbering in the reply text itself.
- Return ONLY valid JSON in this exact format: {"suggestions": ["reply 1", "reply 2", "reply 3"]}`;

export const buildSuggestReplyUserPrompt = (context, conversationText, lastIncomingMessage) => {
  const lastMsgSection = lastIncomingMessage
    ? `\nLast message from ${context.partner.fullName} (respond to this):\n"${lastIncomingMessage.text}"\n`
    : "\nNo incoming messages from partner yet. Suggest friendly conversation starters.\n";

  return `Conversation between ${context.me.fullName} (me) and ${context.partner.fullName} (them):

${conversationText}
${lastMsgSection}
Suggest 3 reply options I (${context.me.fullName}) could send next. Return JSON only.`;
};

export const TRANSLATE_SYSTEM_PROMPT = `You are a translation assistant embedded in a messaging app.
Translate the given message accurately while preserving tone and meaning.

Rules:
- Translate ONLY the message text provided.
- Preserve emojis, names, and proper nouns where appropriate.
- Do not add explanations unless the message is untranslatable.
- Return the translation as plain text, not JSON.`;

export const buildTranslateUserPrompt = (messageText, targetLanguage) => {
  return `Translate the following message to ${targetLanguage}:

"${messageText}"

Return only the translated text.`;
};

export const EXPLAIN_CODE_SYSTEM_PROMPT = `You are a code explanation assistant embedded in a messaging app.
Explain code snippets clearly for a developer audience.

Rules:
- Identify the programming language if possible.
- Explain what the code does step by step.
- Mention key concepts, patterns, or potential issues.
- Keep the explanation concise (3-6 bullet points or short paragraphs).
- If no code is found, say so clearly.`;

export const buildExplainCodeUserPrompt = (messageText, senderName) => {
  return `Message from ${senderName}:

${messageText}

Explain any code in this message. If there is no code, say "No code found in this message."`;
};
