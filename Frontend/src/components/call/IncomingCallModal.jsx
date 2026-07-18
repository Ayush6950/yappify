import { Phone, PhoneOff } from "lucide-react";
import { useCallStore } from "../../store/useCallStore";

const IncomingCallModal = () => {
  const incomingCall = useCallStore((state) => state.incomingCall);
  const acceptCall = useCallStore((state) => state.acceptCall);
  const rejectCall = useCallStore((state) => state.rejectCall);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-[9999] animate-fade-in">
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl p-8 w-[350px] text-center max-w-[90%] transform scale-100 transition-all duration-300">
        <div className="flex flex-col items-center">
          {/* Avatar with glowing heartbeat animation */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-25" />
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md animate-pulse" />
            <img
              src={incomingCall.from?.profilePic || "/avatar.png"}
              alt={incomingCall.from?.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-700 relative z-10 shadow-lg"
            />
          </div>

          <h2 className="mt-6 text-xl font-bold text-slate-100 tracking-tight">
            {incomingCall.from?.fullName}
          </h2>

          <p className="text-cyan-400 text-sm font-semibold mt-2 animate-pulse tracking-wide uppercase">
            Incoming {incomingCall.callType === "video" ? "Video" : "Voice"} Call...
          </p>

          <div className="flex gap-8 mt-8 justify-center">
            {/* Accept Button */}
            <button
              onClick={acceptCall}
              className="
                bg-green-500 hover:bg-green-600
                active:scale-90 transition-all duration-200
                p-4 rounded-full shadow-lg shadow-green-500/30
                border border-green-400/20 hover:shadow-green-500/50
              "
              title="Accept Call"
            >
              <Phone className="text-white w-6 h-6 fill-white" />
            </button>

            {/* Reject Button */}
            <button
              onClick={rejectCall}
              className="
                bg-red-500 hover:bg-red-600
                active:scale-90 transition-all duration-200
                p-4 rounded-full shadow-lg shadow-red-500/30
                border border-red-400/20 hover:shadow-red-500/50
              "
              title="Reject Call"
            >
              <PhoneOff className="text-white w-6 h-6 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;