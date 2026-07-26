import { MessageSquare, Languages, Code2, Sparkles } from "lucide-react";

const ACTIONS = [
  { id: "summarize", label: "Summarize", icon: Sparkles },
  { id: "suggest-reply", label: "Suggest reply", icon: MessageSquare },
  { id: "translate", label: "Translate", icon: Languages },
  { id: "explain-code", label: "Explain code", icon: Code2 },
];

function AIQuickActions({ isLoading, onAction, disabledActions = [] }) {
  return (
    <div className="px-4 py-3 border-b border-slate-800/80">
      <p className="text-xs text-slate-500 mb-2">Quick actions</p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ id, label, icon: Icon }) => {
          const isDisabled = isLoading || disabledActions.includes(id);
          return (
            <button
              key={id}
              onClick={() => onAction(id)}
              disabled={isDisabled}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-violet-500/10 text-violet-300 border border-violet-500/20
                hover:bg-violet-500/20 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AIQuickActions;
