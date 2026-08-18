import { MessageSquare } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-5 rounded-xl border border-slate-800/40 bg-slate-900/10 backdrop-blur-sm">
      <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/5">
        <MessageSquare className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="space-y-1">
        <h4 className="text-slate-200 font-semibold text-base">No conversations yet</h4>
        <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <button
        type="button"
        onClick={() => setActiveTab("contacts")}
        className="px-5 py-2.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 shadow-md shadow-indigo-500/2"
      >
        Find contacts
      </button>
    </div>
  );
}
export default NoChatsFound;