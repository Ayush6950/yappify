import { useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";

export default function AISearchFooter({ onSearch, isLoading }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim() || isLoading) return;
    onSearch?.(query);
    setQuery("");
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/30 px-3 py-2 transition-all duration-200 focus-within:border-violet-400/50 focus-within:ring-4 focus-within:ring-violet-500/10">
      <Sparkles className="size-4 shrink-0 text-violet-400/70" />

      <input
        type="text"
        placeholder="Ask AI anything..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
      />

      <button
        onClick={handleSearch}
        disabled={isLoading || !query.trim()}
        title="Ask AI"
        className={`grid size-7 shrink-0 place-items-center rounded-lg transition-all ${
          query.trim() && !isLoading
            ? "bg-violet-500 text-white hover:bg-violet-400 active:scale-90"
            : "cursor-not-allowed bg-white/[0.05] text-slate-600"
        }`}
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}
