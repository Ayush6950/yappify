import { useState, useRef, useEffect } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, CheckCircle2Icon, Settings, MoreVertical, CameraIcon } from "lucide-react";
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

  // Escape closes the menu — matches the rest of the app's dismiss behaviour
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEsc = (e) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

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

  const click = () => {
    mouseClickSound.currentTime = 0;
    mouseClickSound.play().catch(() => {});
  };

  return (
    <>
      <div className="relative z-20 border-b border-white/[0.07] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          {/* ---------- Identity ---------- */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="relative shrink-0">
              <button
                onClick={() => fileInputRef.current.click()}
                className={`group relative size-12 overflow-hidden rounded-full ring-2 ring-white/10 transition-all duration-300 hover:ring-indigo-400/60 ${
                  isUploading ? "cursor-wait opacity-75" : "cursor-pointer"
                }`}
                title="Change profile picture"
                disabled={isUploading}
              >
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt={authUser.fullName}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Hover affordance */}
                <span className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
                  <CameraIcon className="size-4 text-white" />
                </span>

                {uploadSuccess && (
                  <span className="absolute inset-0 grid place-items-center bg-emerald-500/25 backdrop-blur-[1px]">
                    <CheckCircle2Icon className="size-5 text-emerald-300" />
                  </span>
                )}

                {isUploading && (
                  <span className="absolute inset-0 grid place-items-center bg-black/60">
                    <span className="size-5 rounded-full border-2 border-indigo-300/30 border-t-indigo-300 animate-spin-fast" />
                  </span>
                )}
              </button>

              {/* Presence */}
              <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-brand-surface-sidebar bg-emerald-400 animate-ring-pulse" />

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-100">
                {authUser.fullName}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Active now
              </p>
            </div>
          </div>

          {/* ---------- Actions ---------- */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => {
                click();
                setIsMenuOpen(!isMenuOpen);
              }}
              className={`icon-btn ${isMenuOpen ? "icon-btn-active" : ""}`}
              title="More options"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="size-5" />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-white/[0.09] bg-brand-surface-card/95 p-1.5 shadow-raised backdrop-blur-xl animate-fade-in-down"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    click();
                    toggleSound();
                    setIsMenuOpen(false);
                  }}
                  className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-slate-50"
                >
                  {isSoundEnabled ? (
                    <>
                      <VolumeOffIcon className="size-4 text-slate-500 transition-colors group-hover/item:text-indigo-300" />
                      <span>Mute sounds</span>
                    </>
                  ) : (
                    <>
                      <Volume2Icon className="size-4 text-slate-500 transition-colors group-hover/item:text-indigo-300" />
                      <span>Unmute sounds</span>
                    </>
                  )}
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    click();
                    setIsSettingsOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-slate-50"
                >
                  <Settings className="size-4 text-slate-500 transition-colors group-hover/item:text-indigo-300" />
                  <span>Notification settings</span>
                </button>

                <div className="my-1.5 h-px bg-white/[0.07]" />

                <button
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="group/item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOutIcon className="size-4 text-slate-500 transition-colors group-hover/item:text-red-400" />
                  <span>Log out</span>
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
