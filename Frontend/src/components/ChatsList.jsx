import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import SidebarSearch from "./SidebarSearch";
import Avatar from "./Avatar";
import { useAuthStore } from "../store/useAuthStore";
import { Bot, VolumeXIcon } from "lucide-react";

const AI_PROFILE = { _id: "ai-assistant", fullName: "AI Assistant", isAIProfile: true };

function ChatsList() {
  const {
    getMyChatPartners,
    chats,
    isUsersLoading,
    setSelectedUser,
    selectedUser,
    unreadCounts,
    mutedUsers,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  const filteredChats = chats.filter((chat) =>
    chat.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAISelected = selectedUser?._id === AI_PROFILE._id;

  return (
    <>
      <SidebarSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search chats..." />

      {/* ---------- AI Assistant — pinned above the roster ---------- */}
      <button
        type="button"
        onClick={() => setSelectedUser(AI_PROFILE)}
        className={`group relative mb-2 flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border p-2.5 text-left transition-all duration-200 ${
          isAISelected
            ? "border-violet-400/35 bg-violet-500/[0.12]"
            : "border-white/[0.06] bg-white/[0.02] hover:border-violet-400/25 hover:bg-violet-500/[0.07]"
        }`}
      >
        {isAISelected && (
          <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-violet-400" aria-hidden="true" />
        )}

        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-violet-400/25 bg-gradient-to-br from-violet-500/25 to-indigo-500/15 text-violet-200">
            <Bot className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-violet-100">AI Assistant</span>
            <span className="block truncate text-xs text-slate-500">Ask anything, anytime</span>
          </span>
        </span>

        <span className="chip-violet shrink-0 px-2 py-0.5 text-[10px]">AI</span>
      </button>

      {isUsersLoading ? (
        <UsersLoadingSkeleton />
      ) : filteredChats.length === 0 ? (
        searchQuery ? (
          <p className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-5 text-center text-sm text-slate-500">
            No chats match &ldquo;{searchQuery}&rdquo;
          </p>
        ) : (
          <NoChatsFound />
        )
      ) : (
        <div className="space-y-1">
          {filteredChats.map((chat) => {
            const unreadCount = unreadCounts[chat._id] || 0;
            const isMuted = mutedUsers.includes(chat._id);
            const isActive = selectedUser?._id === chat._id;
            const isOnline = onlineUsers.includes(chat._id);

            return (
              <button
                type="button"
                key={chat._id}
                onClick={() => setSelectedUser(chat)}
                className={`group relative flex w-full items-center justify-between gap-3 rounded-2xl border p-2.5 text-left transition-all duration-200 ${
                  isActive
                    ? "border-indigo-400/30 bg-indigo-500/[0.12]"
                    : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-indigo-400" aria-hidden="true" />
                )}

                <span className="flex min-w-0 items-center gap-3">
                  <Avatar src={chat.profilePic} alt={chat.fullName} size={44} online={isOnline} />
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm font-semibold transition-colors ${
                        isActive ? "text-indigo-100" : "text-slate-200"
                      }`}
                    >
                      {chat.fullName}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {isMuted && <VolumeXIcon className="size-4 text-slate-600" />}
                  {unreadCount > 0 && (
                    <span
                      className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[11px] font-bold leading-none ${
                        isMuted
                          ? "border border-white/10 bg-white/[0.07] text-slate-400"
                          : "bg-indigo-500 text-white shadow-[0_2px_10px_-2px_rgba(99,102,241,0.9)]"
                      }`}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
export default ChatsList;
