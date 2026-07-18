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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full">

      <button
        onClick={toggleMute}
        className="p-3 rounded-full bg-zinc-700 hover:bg-zinc-600 transition"
      >
        {isMuted ? (
          <MicOff className="text-red-400" />
        ) : (
          <Mic className="text-white" />
        )}
      </button>

      <button
        onClick={toggleVideo}
        className="p-3 rounded-full bg-zinc-700 hover:bg-zinc-600 transition"
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