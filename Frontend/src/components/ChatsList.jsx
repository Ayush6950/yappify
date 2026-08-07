import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { Bot, VolumeXIcon } from "lucide-react";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, unreadCounts, mutedUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  const aiProfile = { _id: "ai-assistant", fullName: "AI Assistant", isAIProfile: true };

  return (
    <>
      <div
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border ${selectedUser?._id === aiProfile._id ? "bg-violet-500/10 border-violet-500/35" : "bg-transparent hover:bg-violet-500/5 border-slate-700/30 hover:border-violet-500/25"}`}
        onClick={() => setSelectedUser(aiProfile)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-12 rounded-full grid place-items-center bg-violet-500/10 text-violet-400 border border-violet-500/25"><Bot className="w-6 h-6" /></div>
          <div className="min-w-0"><h4 className="font-semibold text-sm text-violet-350 truncate">AI Assistant</h4><p className="text-xs text-slate-500 truncate">Ask anything</p></div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-350 border border-violet-500/20">AI</span>
      </div>
      {chats.length === 0 && <NoChatsFound />}
      {chats.map((chat) => {
        const unreadCount = unreadCounts[chat._id] || 0;
        const isMuted = mutedUsers.includes(chat._id);

        return (
          <div
            key={chat._id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedUser?._id === chat._id
                ? "bg-indigo-500/10 border border-indigo-500/20 shadow-md shadow-indigo-500/5"
                : "bg-transparent hover:bg-slate-900/30 border border-transparent"
            }`}
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                </div>
              </div>
              <h4 className={`font-semibold truncate text-sm ${selectedUser?._id === chat._id ? "text-indigo-400" : "text-slate-300"}`}>
                {chat.fullName}
              </h4>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isMuted && (
                <VolumeXIcon className="w-4 h-4 text-slate-500" />
              )}
              {unreadCount > 0 && (
                <span className={`
                  flex items-center justify-center min-w-[20px] h-5 text-xs font-semibold px-1.5 rounded-full
                  ${isMuted
                    ? 'bg-slate-700 text-slate-400 border border-slate-600'
                    : 'bg-indigo-500 text-white font-bold'
                  }
                `}>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
export default ChatsList;