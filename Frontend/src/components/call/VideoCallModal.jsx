import { useEffect, useRef } from "react";
import { MicOff, VideoOff } from "lucide-react";
import { useCallStore } from "../../store/useCallStore";
import CallControls from "./CallControls";

const VideoCallModal = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localStream = useCallStore((state) => state.localStream);
  const remoteStream = useCallStore((state) => state.remoteStream);
  const activeCall = useCallStore((state) => state.activeCall);
  const isCalling = useCallStore((state) => state.isCalling);
  const callAccepted = useCallStore((state) => state.callAccepted);
  const callType = useCallStore((state) => state.callType);
  const isMuted = useCallStore((state) => state.isMuted);
  const isVideoEnabled = useCallStore((state) => state.isVideoEnabled);

  const toggleMute = useCallStore((state) => state.toggleMute);
  const toggleVideo = useCallStore((state) => state.toggleVideo);
  const endCall = useCallStore((state) => state.endCall);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const targetUser = activeCall?.from || activeCall;
  const name = targetUser?.fullName || "User";
  const profilePic = targetUser?.profilePic || "/avatar.png";
  const isVideo = callType === "video";

  const statusLabel = !callAccepted
    ? isCalling
      ? "Calling..."
      : "Connecting..."
    : isVideo
      ? "Connected"
      : "Voice call in progress";

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center overflow-hidden bg-brand-surface-deep text-white animate-fade-in">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(17,24,39,0.9)_0%,rgba(3,5,12,1)_100%)]" />
        <div className="absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex size-full items-center justify-center">
        {isVideo && callAccepted ? (
          <div className="relative size-full">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="size-full bg-black object-cover"
            />

            {/* Local picture-in-picture */}
            {isVideoEnabled && localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute right-4 top-4 w-28 rounded-2xl border border-white/[0.12] bg-black object-cover shadow-raised transition-transform duration-300 hover:scale-105 sm:right-6 sm:top-6 sm:w-40 md:w-56"
              />
            )}
          </div>
        ) : (
          <div className="flex max-w-md flex-col items-center px-6 text-center">
            <div className="relative mb-8">
              <span className="absolute inset-0 scale-150 rounded-full bg-indigo-500/25 blur-2xl" aria-hidden="true" />
              {!callAccepted && (
                <span className="absolute -inset-3 rounded-full border border-indigo-400/30 animate-ping" aria-hidden="true" />
              )}
              <img
                src={profilePic}
                alt={name}
                className="relative size-32 rounded-full object-cover ring-4 ring-white/10 md:size-40"
              />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">{name}</h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-indigo-300 animate-pulse">
              {statusLabel}
            </p>

            {/* Self-preview while dialling a video call */}
            {isVideo && !callAccepted && isVideoEnabled && localStream && (
              <div className="mt-8 aspect-[3/4] w-44 overflow-hidden rounded-2xl border border-white/[0.1] bg-black shadow-raised">
                <video ref={localVideoRef} autoPlay playsInline muted className="size-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Status pills */}
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2 sm:left-6 sm:top-6">
          {isMuted && (
            <span className="flex items-center gap-1.5 rounded-full border border-red-400/25 bg-red-500/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md">
              <MicOff className="size-3.5" />
              Muted
            </span>
          )}
          {!isVideoEnabled && isVideo && (
            <span className="flex items-center gap-1.5 rounded-full border border-red-400/25 bg-red-500/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md">
              <VideoOff className="size-3.5" />
              Camera off
            </span>
          )}
        </div>

        <CallControls
          isMuted={isMuted}
          isVideoOff={!isVideoEnabled}
          toggleMute={toggleMute}
          toggleVideo={toggleVideo}
          endCall={endCall}
        />
      </div>
    </div>
  );
};

export default VideoCallModal;
