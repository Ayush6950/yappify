import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Volume2, VolumeX, Bell, Keyboard, Play, Monitor } from "lucide-react";
import toast from "react-hot-toast";
import Toggle from "./Toggle";

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

/** One labelled row in the settings sheet. */
function SettingRow({ icon: Icon, title, description, children, warning }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-300">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
          {warning && <p className="mt-1 text-xs font-medium text-red-400">{warning}</p>}
        </div>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

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

  // Escape closes the sheet
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Notification settings"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/[0.09] bg-brand-surface-card shadow-shell animate-pop-in"
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-500/12 text-indigo-300">
              <Bell className="size-[18px]" />
            </span>
            <h2 className="text-base font-semibold tracking-tight text-slate-100">Notifications</h2>
          </div>
          <button onClick={onClose} className="icon-btn" title="Close">
            <X className="size-5" />
          </button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-4 sm:p-5">
          <section className="space-y-2">
            <h3 className="label-caps px-1">Alerts</h3>

            <SettingRow
              icon={isSoundEnabled ? Volume2 : VolumeX}
              title="Message sounds"
              description="Play an alert when a message arrives."
            >
              <Toggle
                checked={isSoundEnabled}
                onChange={(v) => setNotificationSetting("isSoundEnabled", v)}
                label="Message sounds"
              />
            </SettingRow>

            <SettingRow
              icon={Keyboard}
              title="Typing sounds"
              description="Mechanical keyboard clicks as you type."
            >
              <Toggle
                checked={isKeystrokeSoundEnabled}
                onChange={(v) => setNotificationSetting("isKeystrokeSoundEnabled", v)}
                label="Typing sounds"
              />
            </SettingRow>

            <SettingRow
              icon={Monitor}
              title="Desktop notifications"
              description="Show OS notifications when this tab is in the background."
              warning={localPermission === "denied" ? "Permission is blocked by your browser." : null}
            >
              <Toggle
                checked={isDesktopNotificationsEnabled}
                onChange={handleDesktopToggle}
                label="Desktop notifications"
              />
            </SettingRow>
          </section>

          <section className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <h3 className="label-caps">Alert volume</h3>
              <span className="text-xs font-semibold text-indigo-300">
                {Math.round(notificationVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={notificationVolume}
              onChange={(e) => setNotificationSetting("notificationVolume", parseFloat(e.target.value))}
              disabled={!isSoundEnabled && !isKeystrokeSoundEnabled}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.1] accent-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </section>

          <section className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="label-caps">Notification sound</h3>
            <div className="flex gap-2">
              <select
                value={notificationSoundType}
                onChange={(e) => setNotificationSetting("notificationSoundType", e.target.value)}
                disabled={!isSoundEnabled}
                className="field min-w-0 flex-1 cursor-pointer disabled:opacity-40"
              >
                <option value="default">Default (classic)</option>
                <option value="chime">Synth chime</option>
                <option value="pop">Synth pop</option>
                <option value="bubble">Synth bubble</option>
                <option value="retro">Retro beep</option>
              </select>
              <button
                type="button"
                onClick={playPreview}
                disabled={!isSoundEnabled}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-400/25 bg-indigo-500/12 px-3.5 text-sm font-medium text-indigo-200 transition-all hover:bg-indigo-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                title="Preview selected sound"
              >
                <Play className="size-4" />
                Play
              </button>
            </div>
          </section>
        </div>

        {/* ---------- Footer ---------- */}
        <div className="flex justify-end border-t border-white/[0.07] bg-black/20 px-5 py-4">
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
