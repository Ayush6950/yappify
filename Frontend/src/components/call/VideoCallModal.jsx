import { useEffect, useRef } from "react";
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

  // Handle checking caller or user structure
  const targetUser = activeCall?.from || activeCall;
  const name = targetUser?.fullName || "User";
  const profilePic = targetUser?.profilePic || "/avatar.png";
  const isVideo = callType === "video";

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col justify-center items-center z-[9990] animate-fade-in text-white overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.95)_0%,rgba(2,6,23,1)_100%)] z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full z-0 pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center z-10">
        {isVideo && callAccepted ? (
          // Video Call Connected View
          <div className="relative w-full h-full">
            {/* Remote Video (Full Screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-black"
            />
            {/* Local Video (Floating PIP) */}
            {isVideoEnabled && localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="
                  absolute top-6 right-6 w-36 aspect-[3/4] md:w-56
                  rounded-2xl border-2 border-slate-700 shadow-2xl
                  object-cover bg-slate-900 transition-all duration-300
                  hover:scale-105
                "
              />
            )}
          </div>
        ) : (
          // Voice Call OR Video Call (Dialing/Connecting) View
          <div className="flex flex-col items-center max-w-md px-6 text-center">
            {/* Pulsing profile pic */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-cyan-500 animate-pulse opacity-15 blur-xl scale-150" />
              {!callAccepted && (
                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-60" />
              )}
              <img
                src={profilePic}
                alt={name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-800 shadow-2xl relative z-10"
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">{name}</h2>
            <p className="text-cyan-400 font-semibold mt-3 animate-pulse tracking-wide uppercase text-sm">
              {!callAccepted
                ? isCalling
                  ? "Calling..."
                  : "Connecting..."
                : "Ongoing Voice Call"}
            </p>

            {/* Local Video Preview while dialing (only for Video calls) */}
            {isVideo && !callAccepted && isVideoEnabled && localStream && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl w-48 aspect-[3/4] bg-slate-900">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Muted and Video disabled overlays */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 text-xs text-white z-20">
          {isMuted && (
            <div className="bg-red-500/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-400/20 font-semibold tracking-wide shadow-md uppercase">
              Muted
            </div>
          )}
          {!isVideoEnabled && isVideo && (
            <div className="bg-red-500/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-400/20 font-semibold tracking-wide shadow-md uppercase">
              Camera Off
            </div>
          )}
        </div>

        {/* Global Controls Overlay */}
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