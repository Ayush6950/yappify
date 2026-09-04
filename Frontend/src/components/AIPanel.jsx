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
  "explain-code": "Explaining code...",
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
    askAssistant,
    assistantMessages,
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
  const showEmpty = !streamingText && !isLoading && !error && !showSuggestions;

  return (
    <aside className="absolute inset-0 z-50 flex w-full flex-col border-white/[0.07] bg-brand-surface-sidebar/97 backdrop-blur-2xl animate-fade-in-right sm:relative sm:inset-auto sm:z-auto sm:w-80 sm:border-l sm:bg-black/20 lg:w-[22rem]">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/25 to-indigo-500/15 text-violet-200">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-100">AI Assistant</h3>
            <p className="truncate text-xs text-slate-500">Chat with {selectedUser.fullName}</p>
          </div>
        </div>
        <button onClick={closePanel} className="icon-btn shrink-0" title="Close AI panel">
          <X className="size-4" />
        </button>
      </div>

      <AIQuickActions isLoading={isLoading} onAction={runAction} />

      {/* ---------- Translate target ---------- */}
      <div className="border-b border-white/[0.07] px-4 py-3">
        <label htmlFor="ai-target-language" className="label-caps mb-1.5 block">
          Translate to
        </label>
        <select
          id="ai-target-language"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-xs text-slate-200 transition-colors hover:border-white/[0.14] focus:border-violet-400/60 focus:outline-none"
        >
          {SUPPORTED_LANGUAGES.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- Selected message context ---------- */}
      {selectedMessage && (
        <div className="border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
          <p className="label-caps mb-1">Selected message</p>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
            {selectedMessage.text || "Media message"}
          </p>
        </div>
      )}

      {/* ---------- Output ---------- */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {assistantMessages.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="label-caps">Conversation</p>
            {assistantMessages.map((message, index) => (
              <div
                key={index}
                className={`rounded-2xl px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === "user"
                    ? "ml-6 border border-white/[0.07] bg-white/[0.05] text-slate-300"
                    : "mr-2 border border-violet-400/20 bg-violet-500/[0.1] text-slate-200"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && lastAction === "assistant-chat" && (
              <Loader2 className="size-4 text-violet-400 animate-spin-fast" />
            )}
          </div>
        )}

        {showEmpty && (
          <div className="py-10 text-center">
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-slate-600">
              <Sparkles className="size-6" />
            </span>
            <p className="text-sm font-medium text-slate-400">Ask AI about this chat</p>
            <p className="mx-auto mt-1 max-w-[15rem] text-xs leading-relaxed text-slate-600">
              Summarize the thread, draft a reply, translate a message, or explain some code.
            </p>
          </div>
        )}

        {isLoading && !streamingText && !showSuggestions && (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="size-4 animate-spin-fast" />
            <span className="text-sm">{LOADING_LABELS[lastAction] || "Thinking..."}</span>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {showSuggestions && (
          <AISuggestionChips suggestions={suggestions} onUseAsReply={useSuggestionAsReply} />
        )}

        {showStreaming && (
          <div className="space-y-2.5">
            {originalText && (lastAction === "translate" || lastAction === "explain-code") && (
              <div className="rounded-xl border border-white/[0.06] bg-black/25 p-2.5">
                <p className="label-caps mb-1">Original</p>
                <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">{originalText}</p>
              </div>
            )}
            {messageCount > 0 && lastAction === "summarize" && (
              <p className="text-xs text-slate-600">
                Based on {messageCount} recent message{messageCount !== 1 ? "s" : ""}
              </p>
            )}
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {streamingText}
              {isLoading && (
                <span className="ml-0.5 inline-block h-4 w-1.5 align-middle bg-violet-400 animate-pulse" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------- Footer ---------- */}
      <div className="space-y-2 border-t border-white/[0.07] px-4 py-3">
        {isLoading && (
          <button
            onClick={cancelStream}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-200"
          >
            <Square className="size-3" />
            Stop generating
          </button>
        )}
        <AISearchFooter onSearch={askAssistant} isLoading={isLoading} />
      </div>
    </aside>
  );
}

export default AIPanel;
