import { useState, useRef, useEffect } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, CheckCircle2Icon, Settings, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import NotificationSettingsModal from "./NotificationSettingsModal";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      <div className="relative z-20 p-4 sm:p-6 border-b border-slate-700/40 bg-slate-900/10 backdrop-blur-sm animate-fade-in">
        <div className="relative flex items-center justify-between">
          {/* Left section - Avatar & User info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative group">
              {/* Avatar button */}
              <button
                onClick={() => fileInputRef.current.click()}
                className={`
                  relative size-14 rounded-full overflow-hidden
                  border-2 border-slate-700
                  transition-all duration-300 ease-out
                  hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-955
                  active:scale-95
                  ${isUploading ? "opacity-75 cursor-wait" : "cursor-pointer"}
                `}
                title="Click to change profile picture"
                disabled={isUploading}
              >
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="User image"
                  className="size-full object-cover"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {isUploading ? "..." : "Change"}
                  </span>
                </div>

                {/* Upload success indicator */}
                {uploadSuccess && (
                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center rounded-full">
                    <CheckCircle2Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                )}

                {/* Loading spinner */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-white rounded-full animate-spin-fast" />
                  </div>
                )}

                {/* Online status dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
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
              <h3 className="text-slate-100 font-semibold text-base tracking-tight max-w-[180px] truncate hover:text-indigo-400 transition-colors duration-300">
                {authUser.fullName}
              </h3>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs font-medium text-emerald-500">Online</p>
              </div>
            </div>
          </div>

          {/* Right section - 3-dot Action Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                mouseClickSound.currentTime = 0;
                mouseClickSound.play().catch(() => {});
                setIsMenuOpen(!isMenuOpen);
              }}
              className={`
                relative p-2 rounded-lg transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                group text-slate-400 hover:text-indigo-400 hover:bg-slate-850
                ${isMenuOpen ? "text-indigo-400 bg-slate-850" : ""}
              `}
              title="More options"
            >
              <MoreVertical className="size-5" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700/50 bg-[#1e293b] shadow-xl shadow-black/60 z-50 py-1.5 animate-fade-in-down duration-200">
                {/* Sound toggle option */}
                <button
                  onClick={() => {
                    mouseClickSound.currentTime = 0;
                    mouseClickSound.play().catch(() => {});
                    toggleSound();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 transition-colors duration-200 text-slate-300 hover:text-indigo-400 hover:bg-indigo-550/10 group/item"
                >
                  {isSoundEnabled ? (
                    <>
                      <VolumeOffIcon className="size-4 text-slate-400 group-hover/item:text-indigo-400 transition-colors" />
                      <span>Mute Sounds</span>
                    </>
                  ) : (
                    <>
                      <Volume2Icon className="size-4 text-slate-400 group-hover/item:text-indigo-400 transition-colors" />
                      <span>Unmute Sounds</span>
                    </>
                  )}
                </button>

                {/* Settings option */}
                <button
                  onClick={() => {
                    mouseClickSound.currentTime = 0;
                    mouseClickSound.play().catch(() => {});
                    setIsSettingsOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 transition-colors duration-200 text-slate-300 hover:text-indigo-400 hover:bg-indigo-550/10 group/item"
                >
                  <Settings className="size-4 text-slate-400 group-hover/item:text-indigo-400 transition-colors" />
                  <span>Notification Settings</span>
                </button>

                {/* Divider */}
                <div className="h-px bg-slate-700/50 my-1" />

                {/* Logout option */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-sm text-left flex items-center gap-3 transition-colors duration-200 text-slate-300 hover:text-red-400 hover:bg-red-500/10 group/item"
                >
                  <LogOutIcon className="size-4 text-slate-400 group-hover/item:text-red-400 transition-colors" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

export default ProfileHeader;