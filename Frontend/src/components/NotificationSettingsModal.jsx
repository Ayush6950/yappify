import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Volume2, VolumeX, Bell, BellOff, Keyboard, Play, Monitor } from "lucide-react";
import toast from "react-hot-toast";

const playPreviewSynthSound = (type, volume = 0.5) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "chime") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "bubble") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "retro") {
      osc.type = "square";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.setValueAtTime(0, now + 0.08);
      gain.gain.setValueAtTime(volume, now + 0.1);
      osc.frequency.setValueAtTime(800, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.error("Preview sound error:", e);
  }
};

const NotificationSettingsModal = ({ isOpen, onClose }) => {
  const {
    isSoundEnabled,
    isKeystrokeSoundEnabled,
    notificationVolume,
    notificationSoundType,
    isDesktopNotificationsEnabled,
    setNotificationSetting,
  } = useChatStore();

  const [localPermission, setLocalPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && "Notification" in window) {
      setTimeout(() => {
        setLocalPermission(Notification.permission);
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDesktopToggle = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support desktop notifications.");
      return;
    }

    if (isDesktopNotificationsEnabled) {
      setNotificationSetting("isDesktopNotificationsEnabled", false);
      toast.success("Desktop notifications disabled");
      return;
    }

    const permission = await Notification.requestPermission();
    setLocalPermission(permission);

    if (permission === "granted") {
      setNotificationSetting("isDesktopNotificationsEnabled", true);
      toast.success("Desktop notifications enabled!");
      
      // Send a quick test notification
      new Notification("Notifications Enabled", {
        body: "You will now receive notifications when messages arrive and the app is in the background.",
        icon: "/avatar.png",
      });
    } else {
      toast.error("Notification permission was denied by the browser.");
      setNotificationSetting("isDesktopNotificationsEnabled", false);
    }
  };

  const playPreview = () => {
    if (notificationSoundType === "default") {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = notificationVolume;
      audio.currentTime = 0;
      audio.play().catch((err) => console.log("Failed to play preview sound:", err));
    } else {
      playPreviewSynthSound(notificationSoundType, notificationVolume);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-[9999] animate-fade-in p-4">
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-md transform scale-100 transition-all duration-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/80">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Notification Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
          {/* Global Sound Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {isSoundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <label className="text-sm font-medium text-slate-200">Message Sounds</label>
                </div>
                <p className="text-xs text-slate-400">Play alert sound for incoming messages.</p>
              </div>
              <input
                type="checkbox"
                checked={isSoundEnabled}
                onChange={(e) => setNotificationSetting("isSoundEnabled", e.target.checked)}
                className="checkbox checkbox-primary size-5 rounded-md accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-cyan-400" />
                  <label className="text-sm font-medium text-slate-200">Typing Sounds</label>
                </div>
                <p className="text-xs text-slate-400">Play mechanical typewriter sounds while typing.</p>
              </div>
              <input
                type="checkbox"
                checked={isKeystrokeSoundEnabled}
                onChange={(e) => setNotificationSetting("isKeystrokeSoundEnabled", e.target.checked)}
                className="checkbox checkbox-primary size-5 rounded-md accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <label className="text-sm font-medium text-slate-200">Desktop Notifications</label>
                </div>
                <p className="text-xs text-slate-400">
                  Show OS push notifications when tab is in background.
                  {localPermission === "denied" && (
                    <span className="text-red-400 block font-medium">Permission blocked by browser.</span>
                  )}
                </p>
              </div>
              <input
                type="checkbox"
                checked={isDesktopNotificationsEnabled}
                onChange={handleDesktopToggle}
                className="checkbox checkbox-primary size-5 rounded-md accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <hr className="border-slate-700/50" />

          {/* Volume Control */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-200">Alert Volume</label>
              <span className="text-xs font-semibold text-cyan-400">{Math.round(notificationVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={notificationVolume}
              onChange={(e) => setNotificationSetting("notificationVolume", parseFloat(e.target.value))}
              disabled={!isSoundEnabled && !isKeystrokeSoundEnabled}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          <hr className="border-slate-700/50" />

          {/* Sound Presets */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-200 block">Notification Sound Alert</label>
            <div className="flex gap-2">
              <select
                value={notificationSoundType}
                onChange={(e) => setNotificationSetting("notificationSoundType", e.target.value)}
                disabled={!isSoundEnabled}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="default">Default (Classic MP3)</option>
                <option value="chime">Synth Chime</option>
                <option value="pop">Synth Pop</option>
                <option value="bubble">Synth Bubble</option>
                <option value="retro">Retro Beep</option>
              </select>
              <button
                type="button"
                onClick={playPreview}
                disabled={!isSoundEnabled}
                className="px-3.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 active:scale-95 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Preview selected sound"
              >
                <Play className="w-4 h-4 fill-cyan-400/20" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 text-white hover:bg-cyan-600 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
