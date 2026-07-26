/** Detect if a message contains code blocks or code file references */
export const hasCodeContent = (text, mediaName) => {
  if (text) {
    if (/```[\s\S]*?```/.test(text)) return true;
    if (/`[^`\n]+`/.test(text)) return true;
    if (/\b(function|const|let|var|import|class|def |public |private )\b/.test(text)) return true;
  }

  if (mediaName) {
    const codeExtensions = /\.(js|jsx|ts|tsx|py|java|cpp|c|cs|go|rs|rb|php|swift|kt|sql|html|css|json|yaml|yml|sh|bash|md)$/i;
    if (codeExtensions.test(mediaName)) return true;
  }

  return false;
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
];
