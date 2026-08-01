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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [assistantMessages, isLoading]);

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
    <section className="flex-1 min-h-0 flex flex-col bg-slate-950/30">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 h-[84px] border-b border-slate-800/80 bg-slate-900/20">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedUser(null)} className="sm:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="size-10 sm:size-12 rounded-full grid place-items-center bg-violet-500/15 border border-violet-500/30 text-violet-300 shrink-0"><Bot className="w-5 h-5 sm:w-6 sm:h-6" /></div>
          <div><h2 className="text-slate-100 font-semibold text-sm sm:text-base">AI Assistant</h2><p className="text-xs text-violet-300">Online · Ask anything</p></div>
        </div>
        {assistantMessages.length > 0 && <button onClick={clearAssistantMessages} className="p-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10" title="Clear AI chat"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {!assistantMessages.length && (
          <div className="max-w-xl mx-auto mt-12 text-center animate-fade-in">
            <div className="size-16 rounded-2xl grid place-items-center mx-auto mb-4 bg-violet-500/10 border border-violet-500/20 text-violet-300"><Sparkles className="w-8 h-8" /></div>
            <p className="text-slate-200 font-medium">What can I help you with?</p>
            <p className="text-sm text-slate-500 mt-1">Ask questions, create content, learn, or brainstorm.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {STARTERS.map((starter) => <button key={starter} onClick={() => sendQuestion(starter)} className="px-3 py-2 rounded-full text-xs text-violet-200 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:-translate-y-0.5 transition">{starter}</button>)}
            </div>
          </div>
        )}
        {assistantMessages.map((message, index) => (
          <div key={index} className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap animate-message-in ${message.role === "user" ? "ml-auto bg-amber-500/20 border border-amber-500/25 text-amber-100 rounded-br-md" : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-md"}`}>
            {message.role === "assistant" && <p className="text-[10px] uppercase tracking-wider text-violet-300 mb-1">AI Assistant</p>}{message.content}
          </div>
        ))}
        {isLoading && lastAction === "assistant-chat" && <div className="flex items-center gap-2 text-sm text-violet-300 animate-pulse"><span className="flex gap-1"><i className="size-1.5 rounded-full bg-violet-300 animate-bounce" /><i className="size-1.5 rounded-full bg-violet-300 animate-bounce [animation-delay:150ms]" /><i className="size-1.5 rounded-full bg-violet-300 animate-bounce [animation-delay:300ms]" /></span>AI is thinking...</div>}
        <div ref={endRef} />
      </main>

      <form onSubmit={send} className="flex gap-3 p-4 border-t border-slate-800/80 bg-slate-950/40">
        <input autoFocus value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask AI anything..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition" />
        <button type="submit" disabled={!question.trim() || isLoading} className="p-3 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 active:scale-95 transition disabled:opacity-40" aria-label="Send message to AI"><Send className="w-5 h-5" /></button>
      </form>
      <style>{`@keyframes messageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .animate-message-in { animation: messageIn .2s ease-out; }`}</style>
    </section>
  );
}

export default AIChatConversation;