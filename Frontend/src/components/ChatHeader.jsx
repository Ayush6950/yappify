
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { XIcon, PhoneIcon, VideoIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
 
function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  
  // Add null check
  if (!selectedUser) return null;
  
  const isOnline = onlineUsers.includes(selectedUser._id);
 
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };
 
    window.addEventListener("keydown", handleEscKey);
 
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);
 
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
          relative flex justify-between items-center px-6 flex-1
          bg-gradient-to-r from-slate-800/60 via-slate-800/50 to-slate-800/60
          border-b border-slate-700/50 backdrop-blur-md
          max-h-[84px] animate-fade-in
          shadow-lg shadow-slate-900/50
        "
      >
        {/* Animated gradient background beam */}
        <div
          className={`
            absolute inset-0 rounded-none opacity-0 hover:opacity-100
            transition-opacity duration-500 pointer-events-none
            ${
              isOnline
                ? "bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10"
                : "bg-gradient-to-r from-slate-500/5 via-transparent to-slate-500/5"
            }
          `}
        />
 
        {/* Left section - User info */}
        <div className="flex items-center space-x-4 relative z-10">
          {/* Avatar container with glow */}
          <div className="relative">
            {/* Animated glow ring for online status */}
            {isOnline && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse opacity-75 blur" />
            )}
 
            {/* Avatar */}
            <div
              className={`
                relative w-12 h-12 rounded-full overflow-hidden
                transition-transform duration-300 hover:scale-110
                border-2 ${isOnline ? "border-cyan-400" : "border-slate-600"}
                shadow-lg ${isOnline ? "shadow-cyan-500/30" : "shadow-slate-700/30"}
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
                  border-2 border-slate-900 transition-all duration-300
                  ${
                    isOnline
                      ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"
                      : "bg-slate-500"
                  }
                `}
              />
            </div>
          </div>
 
          {/* User details */}
          <div className="flex flex-col justify-center">
            <h3 className="text-slate-100 font-semibold text-base tracking-tight">
              {selectedUser.fullName}
            </h3>
            <p
              className={`
                text-xs font-medium transition-all duration-300
                ${
                  isOnline
                    ? "text-green-400 font-semibold"
                    : "text-slate-500"
                }
              `}
            >
              {isOnline ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Online
                </span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
 
        {/* Right Actions */}
        <div className="flex items-center gap-2 relative z-10">
 
          {/* Voice Call */}
          <button
            onClick={handleVoiceCall}
            className="
              p-2 rounded-xl
              text-green-400
              hover:bg-green-500/20
              hover:text-green-300
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
              text-cyan-400
              hover:bg-cyan-500/20
              hover:text-cyan-300
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
              hover:bg-slate-700
              hover:text-white
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