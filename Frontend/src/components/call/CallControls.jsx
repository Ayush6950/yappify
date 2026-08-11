import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";

const CallControls = ({
  isMuted,
  isVideoOff,
  toggleMute,
  toggleVideo,
  endCall,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-black/70 backdrop-blur-md px-4 sm:px-6 py-3 rounded-full w-[95%] sm:w-auto justify-center max-w-sm">

      <button
        onClick={toggleMute}
        className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition"
      >
        {isMuted ? (
          <MicOff className="text-red-400" />
        ) : (
          <Mic className="text-white" />
        )}
      </button>

      <button
        onClick={toggleVideo}
        className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition"
      >
        {isVideoOff ? (
          <VideoOff className="text-red-400" />
        ) : (
          <Video className="text-white" />
        )}
      </button>

      <button
        onClick={endCall}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
      >
        <PhoneOff className="text-white" />
      </button>

    </div>
  );
};

export default CallControls;