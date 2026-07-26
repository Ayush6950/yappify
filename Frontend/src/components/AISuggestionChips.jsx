import { Copy, MessageSquarePlus } from "lucide-react";
import toast from "react-hot-toast";

function AISuggestionChips({ suggestions, onUseAsReply }) {
  if (!suggestions || suggestions.length === 0) return null;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 font-medium">Reply suggestions</p>
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="
            group p-3 rounded-lg border border-slate-800/80 bg-slate-900/40
            hover:border-violet-500/30 hover:bg-slate-900/60 transition-colors
          "
        >
          <p className="text-sm text-slate-300 leading-relaxed mb-2">
            {suggestion}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUseAsReply(suggestion)}
              className="
                flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                bg-violet-500/15 text-violet-300 border border-violet-500/25
                hover:bg-violet-500/25 transition-colors
              "
            >
              <MessageSquarePlus className="w-3 h-3" />
              Use as reply
            </button>
            <button
              onClick={() => handleCopy(suggestion)}
              className="
                flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                bg-slate-800/50 text-slate-400 border border-slate-700/50
                hover:bg-slate-800 hover:text-slate-300 transition-colors
              "
              title="Copy to clipboard"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AISuggestionChips;
