import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, CheckCircle2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      
      try {
        await updateProfile({ profilePic: base64Image });
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2000);
      } finally {
        setIsUploading(false);
      }
    };
  };

  return (
    <>
      <div className="relative p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/40 via-slate-800/30 to-slate-800/40 backdrop-blur-sm animate-fade-in">
        {/* Animated background glow */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5 rounded-none" />

        <div className="relative flex items-center justify-between">
          {/* Left section - Avatar & User info */}
          <div className="flex items-center gap-4">
            {/* Avatar with glow */}
            <div className="relative group">
              {/* Animated glow ring - online indicator */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse opacity-60 blur-sm" />
              
              {/* Avatar button */}
              <button
                onClick={() => fileInputRef.current.click()}
                className={`
                  relative size-14 rounded-full overflow-hidden
                  border-2 border-cyan-400 shadow-lg shadow-cyan-500/40
                  transition-all duration-300 ease-out
                  hover:scale-110 hover:shadow-cyan-500/60
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
                  active:scale-95
                  ${isUploading ? "opacity-75 cursor-wait" : "cursor-pointer"}
                `}
                title="Click to change profile picture"
                disabled={isUploading}
              >
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="User image"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Hover overlay with smooth fade */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-white text-sm font-medium">
                      {isUploading ? "Uploading..." : "Change"}
                    </span>
                  </div>
                </div>

                {/* Upload success indicator */}
                {uploadSuccess && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-pulse rounded-full">
                    <CheckCircle2Icon className="w-6 h-6 text-green-400" />
                  </div>
                )}

                {/* Loading spinner */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-cyan-200 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                {/* Online status dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-3 border-slate-900 shadow-lg shadow-green-500/50 animate-pulse" />
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* User info section */}
            <div className="flex flex-col justify-center">
              <h3 className="text-slate-100 font-semibold text-base tracking-tight max-w-[180px] truncate hover:text-cyan-300 transition-colors duration-300">
                {authUser.fullName}
              </h3>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs font-medium text-green-400">Online</p>
              </div>
            </div>
          </div>

          {/* Right section - Action buttons */}
          <div className="flex gap-3 items-center">
            {/* Sound Toggle Button */}
            <button
              onClick={() => {
                mouseClickSound.currentTime = 0;
                mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
                toggleSound();
              }}
              className={`
                relative p-2 rounded-lg transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                group
                ${
                  isSoundEnabled
                    ? "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }
              `}
              title={isSoundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-cyan-400/10" />
              
              <div className="relative transition-all duration-200 group-hover:scale-110 group-active:scale-95">
                {isSoundEnabled ? (
                  <Volume2Icon className="size-5" />
                ) : (
                  <VolumeOffIcon className="size-5" />
                )}
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className={`
                relative p-2 rounded-lg transition-all duration-300 ease-out
                text-slate-400 hover:text-red-400
                focus:outline-none focus:ring-2 focus:ring-red-500/50
                group
              `}
              title="Logout"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-500/10 blur-sm" />
              
              <div className="relative transition-all duration-200 group-hover:scale-110 group-active:scale-95 group-hover:rotate-90">
                <LogOutIcon className="size-5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-spin {
          animation: spin 0.8s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-pulse,
          .animate-spin {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </>
  );
}

export default ProfileHeader;