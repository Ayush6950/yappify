/**
 * Safely parse JSON from LLM output, with fallback for markdown code fences.
 */
export const parseJsonFromLLM = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response from LLM");
  }

  const trimmed = rawText.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall through
  }

  // Extract from ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // Fall through
    }
  }

  // Try to find a JSON array or object in the text
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      // Fall through
    }
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // Fall through
    }
  }

  throw new Error("Could not parse JSON from LLM response");
};

/**
 * Normalize suggest-reply output to exactly 3 string suggestions.
 */
export const normalizeSuggestions = (parsed) => {
  let items = parsed;

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    items = parsed.suggestions || parsed.replies || parsed.options;
  }

  if (!Array.isArray(items)) {
    throw new Error("Expected an array of suggestions");
  }

  const strings = items
    .map((item) => (typeof item === "string" ? item : item?.text || item?.reply))
    .filter(Boolean)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (strings.length === 0) {
    throw new Error("No valid suggestions in LLM response");
  }

  return strings.slice(0, 3);
};
