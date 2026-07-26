import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
export default function AISearchFooter({ onSearch, isLoading }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;

    onSearch?.(query);
    setQuery(""); // Optional: clear input after search
  };

  return (
    <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-900/40">
      <div
        className="
          flex items-center gap-2
          w-full
          rounded-xl
          border border-slate-800
          bg-slate-950/40
          px-3 py-2
          focus-within:border-violet-500/50
          transition-colors
        "
      >
        <Sparkles className="w-4 h-4 text-violet-500/50 shrink-0" />

        <input
          type="text"
          placeholder="Ask from AI..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="
            flex-1
            bg-transparent
            text-sm
            text-slate-200
            placeholder:text-slate-500
            outline-none
          "
        />

        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="
            px-3 py-1.5
            rounded-lg
            bg-violet-500/10
            text-violet-400
            hover:bg-violet-500/20
            hover:text-violet-300
            transition-colors
            text-xs
            font-medium disabled:opacity-50
          "
        >
          <Bot/>
        </button>
      </div>
    </div>
  );
}