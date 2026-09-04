import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { XIcon, PhoneIcon, VideoIcon, Volume2Icon, VolumeXIcon, Sparkles, ArrowLeft } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAIStore } from "../store/useAIStore";
import Avatar from "./Avatar";

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "Offline";

  const date = new Date(lastSeen);
  const diffMins = Math.floor((new Date() - date) / 60000);

  if (diffMins < 1) return "Last seen just now";
  if (diffMins < 60) return `Last seen ${diffMins}m ago`;

  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `Last seen ${diffHrs}h ago`;

  return `Last seen ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

function ChatHeader() {
  const { selectedUser, setSelectedUser, mutedUsers, toggleUserMute } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { isPanelOpen, togglePanel } = useAIStore();

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isMuted = mutedUsers.includes(selectedUser._id);

  const handleClose = () => setSelectedUser(null);

  const handleVoiceCall = () => {
    useCallStore.getState().startCall({ user: selectedUser, callType: "voice" });
  };

  const handleVideoCall = () => {
    useCallStore.getState().startCall({ user: selectedUser, callType: "video" });
  };

  return (
    <header className="relative z-20 flex h-16 flex-none items-center justify-between gap-2 border-b border-white/[0.07] bg-black/20 px-3 backdrop-blur-xl sm:h-[76px] sm:px-5">
      {/* ---------- Identity ---------- */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Back button — the primary way out of a chat on mobile */}
        <button
          onClick={handleClose}
          className="icon-btn -ml-1 sm:hidden"
          title="Back to chats"
        >
          <ArrowLeft className="size-5" />
        </button>

        <Avatar
          src={selectedUser.profilePic}
          alt={selectedUser.fullName}
          size={42}
          online={isOnline}
          ring
        />

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-slate-100 sm:text-[15px]">
            {selectedUser.fullName}
          </h3>
          <p
            className={`truncate text-xs font-medium ${
              isOnline ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {isOnline ? (
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            ) : (
              formatLastSeen(selectedUser.lastSeen)
            )}
          </p>
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <button
          onClick={togglePanel}
          className={`icon-btn ${isPanelOpen ? "bg-violet-500/15 text-violet-300" : "hover:text-violet-300"}`}
          title="AI Assistant"
          aria-pressed={isPanelOpen}
        >
          <Sparkles className="size-[18px] sm:size-5" />
        </button>

        <button
          onClick={() => toggleUserMute(selectedUser._id)}
          className={`icon-btn ${isMuted ? "text-red-400 hover:text-red-300" : ""}`}
          title={isMuted ? "Unmute notifications" : "Mute notifications"}
          aria-pressed={isMuted}
        >
          {isMuted ? (
            <VolumeXIcon className="size-[18px] sm:size-5" />
          ) : (
            <Volume2Icon className="size-[18px] sm:size-5" />
          )}
        </button>

        <span className="mx-1 hidden h-6 w-px bg-white/[0.08] sm:block" aria-hidden="true" />

        <button
          onClick={handleVoiceCall}
          className="icon-btn text-indigo-300 hover:bg-indigo-500/15 hover:text-indigo-200"
          title="Voice call"
        >
          <PhoneIcon className="size-[18px] sm:size-5" />
        </button>

        <button
          onClick={handleVideoCall}
          className="icon-btn text-indigo-300 hover:bg-indigo-500/15 hover:text-indigo-200"
          title="Video call"
        >
          <VideoIcon className="size-[18px] sm:size-5" />
        </button>

        <button
          onClick={handleClose}
          className="icon-btn hidden sm:grid"
          title="Close chat (Esc)"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
