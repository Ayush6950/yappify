import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { VolumeXIcon } from "lucide-react";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, unreadCounts, mutedUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const unreadCount = unreadCounts[chat._id] || 0;
        const isMuted = mutedUsers.includes(chat._id);

        return (
          <div
            key={chat._id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedUser?._id === chat._id
                ? "bg-amber-500/10 border border-amber-500/20 shadow-md shadow-amber-500/5"
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
              <h4 className={`font-semibold truncate text-sm ${selectedUser?._id === chat._id ? "text-amber-400" : "text-slate-300"}`}>
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
                    : 'bg-amber-500 text-slate-950 font-bold'
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