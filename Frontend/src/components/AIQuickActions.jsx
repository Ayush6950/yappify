import { MessageSquare, Languages, Code2, Sparkles } from "lucide-react";

const ACTIONS = [
  { id: "summarize", label: "Summarize", icon: Sparkles },
  { id: "suggest-reply", label: "Suggest reply", icon: MessageSquare },
  { id: "translate", label: "Translate", icon: Languages },
  { id: "explain-code", label: "Explain code", icon: Code2 },
];

function AIQuickActions({ isLoading, onAction, disabledActions = [] }) {
  return (
    <div className="border-b border-white/[0.07] px-4 py-3">
      <p className="label-caps mb-2">Quick actions</p>
      <div className="grid grid-cols-2 gap-1.5">
        {ACTIONS.map(({ id, label, icon: Icon }) => {
          const isDisabled = isLoading || disabledActions.includes(id);
          return (
            <button
              key={id}
              onClick={() => onAction(id)}
              disabled={isDisabled}
              className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.08] px-2.5 py-2 text-xs font-medium text-violet-200 transition-all duration-200 hover:border-violet-400/35 hover:bg-violet-500/[0.16] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AIQuickActions;
