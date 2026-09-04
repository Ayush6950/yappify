import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, Trash2, ArrowLeft } from "lucide-react";
import { useAIStore } from "../store/useAIStore";
import { useChatStore } from "../store/useChatStore";

const STARTERS = [
  "Explain this simply",
  "Help me write a message",
  "Give me a study plan",
  "Brainstorm an idea",
];

function AIChatConversation() {
  const { assistantMessages, askAssistant, clearAssistantMessages, isLoading, lastAction } = useAIStore();
  const { setSelectedUser } = useChatStore();
  const [question, setQuestion] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [assistantMessages, isLoading]);

  const sendQuestion = (text) => {
    if (!text.trim() || isLoading) return;
    askAssistant(text);
    setQuestion("");
  };

  const send = (event) => {
    event.preventDefault();
    sendQuestion(question);
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* ---------- Header ---------- */}
      <header className="flex h-16 flex-none items-center justify-between gap-3 border-b border-white/[0.07] bg-black/20 px-3 backdrop-blur-xl sm:h-[76px] sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setSelectedUser(null)}
            className="icon-btn -ml-1 sm:hidden"
            title="Back to chats"
          >
            <ArrowLeft className="size-5" />
          </button>

          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-violet-400/25 bg-gradient-to-br from-violet-500/25 to-indigo-500/15 text-violet-200 sm:size-11">
            <Bot className="size-5" />
          </span>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-[15px]">
              AI Assistant
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-violet-300">
              <span className="size-1.5 rounded-full bg-violet-400" />
              Always available
            </p>
          </div>
        </div>

        {assistantMessages.length > 0 && (
          <button
            onClick={clearAssistantMessages}
            className="icon-btn hover:bg-red-500/10 hover:text-red-300"
            title="Clear conversation"
          >
            <Trash2 className="size-5" />
          </button>
        )}
      </header>

      {/* ---------- Thread ---------- */}
      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-6 sm:px-6">
        {!assistantMessages.length && (
          <div className="mx-auto mt-10 max-w-xl text-center animate-fade-in">
            <div className="relative mx-auto mb-5 w-fit">
              <span className="absolute inset-0 rounded-3xl bg-violet-500/25 blur-2xl" aria-hidden="true" />
              <span className="relative grid size-16 place-items-center rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-violet-200 animate-float">
                <Sparkles className="size-8" />
              </span>
            </div>

            <p className="text-lg font-semibold text-slate-100">What can I help you with?</p>
            <p className="mt-1.5 text-sm text-slate-500">
              Ask questions, create content, learn something, or brainstorm.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => sendQuestion(starter)}
                  className="rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3.5 py-2 text-xs font-medium text-violet-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/35 hover:bg-violet-500/[0.18]"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-3">
          {assistantMessages.map((message, index) => (
            <div
              key={index}
              className={`w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft animate-message-in sm:max-w-[75%] ${
                message.role === "user"
                  ? "ml-auto rounded-br-md border border-indigo-400/25 bg-gradient-to-br from-indigo-500/25 to-violet-500/15 text-indigo-50"
                  : "rounded-bl-md border border-white/[0.07] bg-brand-surface-card text-slate-200"
              }`}
            >
              {message.role === "assistant" && (
                <p className="label-caps mb-1.5 text-violet-300/80">AI Assistant</p>
              )}
              {message.content}
            </div>
          ))}

          {isLoading && lastAction === "assistant-chat" && (
            <div className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-md border border-white/[0.07] bg-brand-surface-card px-4 py-3 text-sm text-violet-300">
              <span className="flex gap-1">
                <i className="size-1.5 animate-bounce rounded-full bg-violet-300" />
                <i className="size-1.5 animate-bounce rounded-full bg-violet-300 [animation-delay:150ms]" />
                <i className="size-1.5 animate-bounce rounded-full bg-violet-300 [animation-delay:300ms]" />
              </span>
              Thinking...
            </div>
          )}

          <div ref={endRef} />
        </div>
      </main>

      {/* ---------- Composer ---------- */}
      <form
        onSubmit={send}
        className="flex-none border-t border-white/[0.07] bg-black/25 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <input
            autoFocus
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask AI anything..."
            className="min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-violet-400/50 focus:bg-black/45 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            aria-label="Send message to AI"
            className={`grid size-[46px] shrink-0 place-items-center rounded-2xl transition-all duration-300 ${
              question.trim() && !isLoading
                ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-glow hover:from-violet-400 hover:to-indigo-500 active:scale-90"
                : "cursor-not-allowed border border-white/[0.06] bg-white/[0.03] text-slate-600"
            }`}
          >
            <Send className="size-[18px]" />
          </button>
        </div>
      </form>
    </section>
  );
}

export default AIChatConversation;
