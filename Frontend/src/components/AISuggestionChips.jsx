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
      <p className="label-caps">Reply suggestions</p>

      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 transition-colors duration-200 hover:border-violet-400/25 hover:bg-white/[0.05]"
        >
          <p className="mb-2.5 text-sm leading-relaxed text-slate-300">{suggestion}</p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUseAsReply(suggestion)}
              className="flex items-center gap-1.5 rounded-lg border border-violet-400/25 bg-violet-500/15 px-2.5 py-1.5 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-500/25"
            >
              <MessageSquarePlus className="size-3.5" />
              Use as reply
            </button>
            <button
              onClick={() => handleCopy(suggestion)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-200"
              title="Copy to clipboard"
            >
              <Copy className="size-3.5" />
              Copy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AISuggestionChips;
