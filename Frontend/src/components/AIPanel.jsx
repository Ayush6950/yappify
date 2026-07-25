import { useEffect } from "react";
import { Sparkles, X, Loader2, Square } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";

function AIPanel() {
  const { selectedUser } = useChatStore();
  const {
    isLoading,
    streamingText,
    lastAction,
    error,
    messageCount,
    contextPartnerId,
    closePanel,
    cancelStream,
    runAction,
    resetForPartnerChange,
  } = useAIStore();

  useEffect(() => {
    if (!selectedUser) return;
    if (contextPartnerId && contextPartnerId !== selectedUser._id) {
      resetForPartnerChange(selectedUser._id);
    }
  }, [selectedUser, contextPartnerId, resetForPartnerChange]);

  if (!selectedUser) return null;

  const handleSummarize = () => {
    runAction("summarize");
  };

  return (
    <div className="w-80 flex flex-col border-l border-slate-800/80 bg-slate-900/40 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 truncate">
              AI Assistant
            </h3>
            <p className="text-xs text-slate-500 truncate">
              Chat with {selectedUser.fullName}
            </p>
          </div>
        </div>
        <button
          onClick={closePanel}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title="Close AI panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-3 border-b border-slate-800/80">
        <p className="text-xs text-slate-500 mb-2">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSummarize}
            disabled={isLoading}
            className="
              px-3 py-1.5 rounded-lg text-xs font-medium
              bg-violet-500/10 text-violet-300 border border-violet-500/20
              hover:bg-violet-500/20 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Summarize
          </button>
        </div>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!streamingText && !isLoading && !error && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Ask AI to help with this conversation
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Try summarizing the chat with {selectedUser.fullName}
            </p>
          </div>
        )}

        {isLoading && !streamingText && (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              {lastAction === "summarize" ? "Summarizing..." : "Thinking..."}
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {streamingText && (
          <div className="space-y-2">
            {messageCount > 0 && (
              <p className="text-xs text-slate-600">
                Based on {messageCount} recent message{messageCount !== 1 ? "s" : ""}
              </p>
            )}
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {streamingText}
              {isLoading && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-violet-400 animate-pulse align-middle" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800/80 space-y-2">
        {isLoading && (
          <button
            onClick={cancelStream}
            className="
              w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              text-xs font-medium text-slate-400
              bg-slate-800/50 hover:bg-slate-800 transition-colors
            "
          >
            <Square className="w-3 h-3" />
            Stop generating
          </button>
        )}
        <p className="text-[10px] text-slate-600 text-center">
          AI reads messages in this chat to assist you
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default AIPanel;
