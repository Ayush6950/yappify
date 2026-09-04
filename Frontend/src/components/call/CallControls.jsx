import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const CallControls = ({ isMuted, isVideoOff, toggleMute, toggleVideo, endCall }) => {
  const base =
    "grid size-12 place-items-center rounded-full border transition-all duration-200 active:scale-90 sm:size-14";

  return (
    <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/[0.1] bg-black/60 px-4 py-3 backdrop-blur-2xl sm:gap-4 sm:px-6">
      <button
        onClick={toggleMute}
        title={isMuted ? "Unmute" : "Mute"}
        aria-pressed={isMuted}
        className={`${base} ${
          isMuted
            ? "border-red-400/30 bg-red-500/20 text-red-300"
            : "border-white/[0.1] bg-white/[0.08] text-white hover:bg-white/[0.14]"
        }`}
      >
        {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
      </button>

      <button
        onClick={toggleVideo}
        title={isVideoOff ? "Turn camera on" : "Turn camera off"}
        aria-pressed={isVideoOff}
        className={`${base} ${
          isVideoOff
            ? "border-red-400/30 bg-red-500/20 text-red-300"
            : "border-white/[0.1] bg-white/[0.08] text-white hover:bg-white/[0.14]"
        }`}
      >
        {isVideoOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
      </button>

      <button
        onClick={endCall}
        title="End call"
        className={`${base} border-red-400/30 bg-red-600 text-white shadow-[0_8px_28px_-8px_rgba(220,38,38,1)] hover:bg-red-500`}
      >
        <PhoneOff className="size-5" />
      </button>
    </div>
  );
};

export default CallControls;
