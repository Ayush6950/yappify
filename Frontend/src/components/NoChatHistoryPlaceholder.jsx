import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const SUGGESTIONS = [
  { emoji: "👋", text: "Hey there!" },
  { emoji: "🤝", text: "How are you doing?" },
  { emoji: "📅", text: "Free to meet up soon?" },
];

const NoChatHistoryPlaceholder = ({ name }) => {
  const { setDraftMessage } = useChatStore();

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center animate-fade-in">
      <div className="relative mb-6">
        <span className="absolute inset-0 rounded-full bg-indigo-500/25 blur-2xl" aria-hidden="true" />
        <span className="relative grid size-16 place-items-center rounded-2xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 animate-float">
          <MessageCircleIcon className="size-8 text-indigo-300" />
        </span>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-slate-100 sm:text-xl animate-slide-up">
        Say hello to <span className="text-gradient">{name}</span>
      </h3>

      <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-500 animate-slide-up animation-delay-150">
        This is the very beginning of your conversation. Pick a starter below or write your own.
      </p>

      <div className="flex flex-wrap justify-center gap-2 animate-slide-up animation-delay-300">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.text}
            type="button"
            onClick={() => setDraftMessage(`${suggestion.emoji} ${suggestion.text}`)}
            className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200"
            title={`Draft "${suggestion.emoji} ${suggestion.text}"`}
          >
            <span className="transition-transform duration-300 group-hover:scale-125">
              {suggestion.emoji}
            </span>
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
