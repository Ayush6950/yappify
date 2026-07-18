
import { useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
 
const VideoPreview = ({ onClose }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
 
  // ✅ FIX 1: Use selector functions to get state
  const localStream = useCallStore((state) => state.localStream);
  const remoteStream = useCallStore((state) => state.remoteStream);
  const endCall = useCallStore((state) => state.endCall);
  const toggleMute = useCallStore((state) => state.toggleMute);
  const toggleVideo = useCallStore((state) => state.toggleVideo);
  const isMuted = useCallStore((state) => state.isMuted);
  const isVideoEnabled = useCallStore((state) => state.isVideoEnabled);
 
  // ✅ FIX 2: Attach streams to video elements
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
 
  // ✅ FIX 3: Handle end call properly
  const handleEndCall = () => {
    endCall();
    onClose?.();
  };
 
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 w-full max-w-4xl aspect-video">
        
        {/* Remote Video - Full Screen */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full bg-black object-cover"
        />
 
        {/* Local Video - Picture in Picture */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-48 h-36 rounded-lg border-2 border-slate-400 object-cover bg-black"
        />
 
        {/* ✅ FIX 4: Separate Control Buttons */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
          
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="text-white" size={24} />
            ) : (
              <Mic className="text-white" size={24} />
            )}
          </button>
 
          {/* Video Toggle Button */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoEnabled
                ? "bg-slate-700 hover:bg-slate-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
            title={isVideoEnabled ? "Stop Video" : "Start Video"}
          >
            {isVideoEnabled ? (
              <Video className="text-white" size={24} />
            ) : (
              <VideoOff className="text-white" size={24} />
            )}
          </button>
 
          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
            title="End Call"
          >
            <PhoneOff className="text-white" size={28} />
          </button>
        </div>
 
        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 text-xs text-white">
          {isMuted && (
            <div className="bg-red-500/80 px-2 py-1 rounded">Muted</div>
          )}
          {!isVideoEnabled && (
            <div className="bg-red-500/80 px-2 py-1 rounded">Video Off</div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default VideoPreview;