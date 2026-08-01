import { useEffect } from "react";
import { Sparkles, X, Loader2, Square } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";
import { SUPPORTED_LANGUAGES } from "../lib/aiUtils";
import AIQuickActions from "./AIQuickActions";
import AISuggestionChips from "./AISuggestionChips";
import AISearchFooter from "./AISearchFooter";

const LOADING_LABELS = {
  summarize: "Summarizing...",
  "suggest-reply": "Generating replies...",
  translate: "Translating...",
  "explain-code": "Explaining code..."
};

function AIPanel() {
  const { selectedUser } = useChatStore();
  const {
    isLoading,
    streamingText,
    lastAction,
    error,
    messageCount,
    contextPartnerId,
    suggestions,
    selectedMessage,
    targetLanguage,
    originalText,
    closePanel,
    cancelStream,
    runAction,
    resetForPartnerChange,
    useSuggestionAsReply,
    setTargetLanguage,
    askAssistant, assistantMessages,
  } = useAIStore();

  useEffect(() => {
    if (!selectedUser) return;
    if (contextPartnerId && contextPartnerId !== selectedUser._id) {
      resetForPartnerChange(selectedUser._id);
    }
  }, [selectedUser, contextPartnerId, resetForPartnerChange]);

  if (!selectedUser) return null;

  const showSuggestions = lastAction === "suggest-reply" && suggestions.length > 0;
  const showStreaming = streamingText && lastAction !== "suggest-reply";
  const showEmpty =
    !streamingText && !isLoading && !error && !showSuggestions;

  return (
    <div className="w-full sm:w-80 absolute inset-0 z-50 sm:relative sm:z-auto sm:inset-auto flex flex-col sm:border-l border-slate-800/80 bg-slate-900/95 sm:bg-slate-900/40 animate-fade-in">
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

      <AIQuickActions
        isLoading={isLoading}
        onAction={runAction}
      />

      {/* Language picker for translate */}
      <div className="px-4 py-2 border-b border-slate-800/80">
        <label className="text-xs text-slate-500 mb-1 block">Translate to</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="
            w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5
            text-xs text-slate-300 focus:outline-none focus:border-violet-500/50
          "
        >
          {SUPPORTED_LANGUAGES.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Selected message context */}
      {selectedMessage && (
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/30">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">
            Selected message
          </p>
          <p className="text-xs text-slate-400 line-clamp-2">
            {selectedMessage.text || "Media message"}
          </p>
        </div>
      )}

      {/* Output area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {assistantMessages.length > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-xs text-violet-300 font-medium">AI Assistant</p>
            {assistantMessages.map((message, index) => (
              <div key={index} className={`rounded-lg p-2.5 text-sm whitespace-pre-wrap ${message.role === "user" ? "bg-slate-800 text-slate-300 ml-5" : "bg-violet-500/10 border border-violet-500/20 text-slate-200 mr-2"}`}>{message.content}</div>
            ))}
            {isLoading && lastAction === "assistant-chat" && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
          </div>
        )}

                {showEmpty && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Ask AI to help with this conversation
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Summarize, suggest replies, translate, or explain code
            </p>
          </div>
        )}

        {isLoading && !streamingText && !showSuggestions && (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              {LOADING_LABELS[lastAction] || "Thinking..."}
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {showSuggestions && (
          <AISuggestionChips
            suggestions={suggestions}
            onUseAsReply={useSuggestionAsReply}
          />
        )}

        {showStreaming && (
          <div className="space-y-2">
            {originalText && (lastAction === "translate" || lastAction === "explain-code") && (
              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">
                  Original
                </p>
                <p className="text-xs text-slate-500 line-clamp-3">{originalText}</p>
              </div>
            )}
            {messageCount > 0 && lastAction === "summarize" && (
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
       <AISearchFooter onSearch={askAssistant} isLoading={isLoading} />

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
