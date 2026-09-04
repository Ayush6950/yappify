import { MessageSquarePlus } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.02] px-5 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
        <MessageSquarePlus className="size-7" />
      </span>

      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-200">No conversations yet</h4>
        <p className="mx-auto max-w-[16rem] text-xs leading-relaxed text-slate-500">
          Add someone from Contacts and your chats will show up here.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setActiveTab("contacts")}
        className="rounded-xl border border-indigo-400/25 bg-indigo-500/12 px-4 py-2 text-xs font-semibold text-indigo-200 transition-all duration-200 hover:border-indigo-400/40 hover:bg-indigo-500/20 active:scale-95"
      >
        Find contacts
      </button>
    </div>
  );
}
export default NoChatsFound;
