
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { XIcon, PhoneIcon, VideoIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
 
function ChatHeader() {
  const { selectedUser, setSelectedUser, mutedUsers, toggleUserMute } = useChatStore();
  const { onlineUsers } = useAuthStore();
  
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };
 
    window.addEventListener("keydown", handleEscKey);
 
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);
  
  // Add null check after hook
  if (!selectedUser) return null;
  
  const isOnline = onlineUsers.includes(selectedUser._id);
 
  const handleClose = () => {
    setSelectedUser(null);
  };
 
  // ✅ Add these missing handlers
  const handleVoiceCall = () => {
    useCallStore.getState().startCall({ user: selectedUser, callType: "voice" });
  };
 
  const handleVideoCall = () => {
    useCallStore.getState().startCall({ user: selectedUser, callType: "video" });
  };
  return (
    <>
      <div
        className="
          relative flex justify-between items-center px-6 py-4 flex-none h-[84px]
          bg-slate-900/20 border-b border-slate-800/80 animate-fade-in
        "
      >
        {/* Left section - User info */}
        <div className="flex items-center space-x-4 relative z-10">
          {/* Avatar container */}
          <div className="relative">
            {/* Avatar */}
            <div
              className={`
                relative w-12 h-12 rounded-full overflow-hidden
                transition-transform duration-300 hover:scale-110
                border-2 ${isOnline ? "border-emerald-500/50" : "border-slate-800"}
              `}
            >
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
              />
 
              {/* Status indicator dot */}
              <div
                className={`
                  absolute bottom-0 right-0 w-3 h-3 rounded-full
                  border-2 border-slate-950 transition-all duration-300
                  ${
                    isOnline
                      ? "bg-green-500"
                      : "bg-slate-700"
                  }
                `}
              />
            </div>
          </div>
 
          {/* User details */}
          <div className="flex flex-col justify-center">
            <h3 className="text-slate-200 font-semibold text-base tracking-tight">
              {selectedUser.fullName}
            </h3>
            <p
              className={`
                text-xs font-medium transition-all duration-300
                ${
                  isOnline
                    ? "text-emerald-500 font-semibold"
                    : "text-slate-500"
                }
              `}
            >
              {isOnline ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Online
                </span>
              ) : (
                (() => {
                  if (!selectedUser.lastSeen) return "Offline";
                  const date = new Date(selectedUser.lastSeen);
                  const diffMs = new Date() - date;
                  const diffMins = Math.floor(diffMs / 60000);
                  if (diffMins < 1) return "Offline (just now)";
                  if (diffMins < 60) return `Last seen ${diffMins}m ago`;
                  const diffHrs = Math.floor(diffMins / 60);
                  if (diffHrs < 24) return `Last seen ${diffHrs}h ago`;
                  return `Last seen ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
                })()
              )}
            </p>
          </div>
        </div>
 
        {/* Right Actions */}
        <div className="flex items-center gap-2 relative z-10">
 
          {/* Mute Chat Toggle */}
          <button
            onClick={() => toggleUserMute(selectedUser._id)}
            className={`
              p-2 rounded-xl transition-all duration-200 active:scale-95
              ${mutedUsers.includes(selectedUser._id)
                ? "text-red-400 hover:bg-red-500/10"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }
            `}
            title={mutedUsers.includes(selectedUser._id) ? "Unmute Notifications" : "Mute Notifications"}
          >
            {mutedUsers.includes(selectedUser._id) ? (
              <VolumeXIcon className="w-5 h-5" />
            ) : (
              <Volume2Icon className="w-5 h-5" />
            )}
          </button>
 
          {/* Voice Call */}
          <button
            onClick={handleVoiceCall}
            className="
              p-2 rounded-xl
              text-amber-400
              hover:bg-amber-500/10
              transition-all duration-200
              active:scale-95
            "
            title="Voice Call"
          >
            <PhoneIcon className="w-5 h-5" />
          </button>
 
          {/* Video Call */}
          <button
            onClick={handleVideoCall}
            className="
              p-2 rounded-xl
              text-amber-400
              hover:bg-amber-500/10
              transition-all duration-200
              active:scale-95
            "
            title="Video Call"
          >
            <VideoIcon className="w-5 h-5" />
          </button>
 
          {/* Close */}
          <button
            onClick={handleClose}
            className="
              p-2 rounded-xl
              text-slate-400
              hover:bg-slate-800
              hover:text-slate-200
              transition-all duration-200
              active:scale-95
            "
            title="Close Chat"
          >
            <XIcon className="w-5 h-5" />
          </button>
 
        </div>
 
      </div>
 

 
      {/* Add keyframe animations to your global CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
 
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
 
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
 
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
 
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-pulse {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
 
export default ChatHeader;