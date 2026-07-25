import OpenAI from "openai";
import { ENV } from "../lib/env.js";

const groq = new OpenAI({
  apiKey: ENV.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const DEFAULT_MODEL = "llama-3.3-70b-versatile"; // or llama-3.1-8b-instant (faster)

export const complete = async ({ systemPrompt, userPrompt, temperature = 0.3 }) => {
  if (!ENV.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from LLM");

  return { text, model: DEFAULT_MODEL, usage: response.usage };
};

export const streamComplete = async ({
  systemPrompt,
  userPrompt,
  temperature = 0.3,
  onChunk,
}) => {
  if (!ENV.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const stream = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  let fullText = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    if (delta) {
      fullText += delta;
      onChunk(delta, fullText);
    }
  }

  if (!fullText.trim()) {
    throw new Error("Empty response from LLM");
  }

  return { text: fullText.trim(), model: DEFAULT_MODEL };
};