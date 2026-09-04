import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../../store/useCallStore";

const IncomingCallModal = () => {
  const incomingCall = useCallStore((state) => state.incomingCall);
  const acceptCall = useCallStore((state) => state.acceptCall);
  const rejectCall = useCallStore((state) => state.rejectCall);

  if (!incomingCall) return null;

  const isVideo = incomingCall.callType === "video";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.09] bg-brand-surface-card shadow-shell animate-pop-in">
        <div className="flex flex-col items-center px-6 py-8 text-center sm:px-8">
          {/* Avatar with a live ring */}
          <div className="relative mb-6">
            <span className="absolute inset-0 rounded-full bg-indigo-500/40 blur-2xl" aria-hidden="true" />
            <span className="absolute -inset-2 rounded-full border border-indigo-400/40 animate-ping" aria-hidden="true" />
            <img
              src={incomingCall.from?.profilePic || "/avatar.png"}
              alt={incomingCall.from?.fullName || "Caller"}
              className="relative size-24 rounded-full object-cover ring-4 ring-white/10"
            />
          </div>

          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-500/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
            {isVideo ? <Video className="size-3" /> : <Phone className="size-3" />}
            Incoming {isVideo ? "video" : "voice"} call
          </span>

          <h2 className="text-xl font-bold tracking-tight text-slate-50">
            {incomingCall.from?.fullName || "Unknown caller"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 animate-pulse">Ringing...</p>

          <div className="mt-8 flex items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={rejectCall}
                title="Decline"
                className="grid size-14 place-items-center rounded-full bg-red-600 text-white shadow-[0_10px_30px_-10px_rgba(220,38,38,1)] transition-all duration-200 hover:bg-red-500 active:scale-90"
              >
                <PhoneOff className="size-6" />
              </button>
              <span className="text-xs text-slate-500">Decline</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={acceptCall}
                title="Accept"
                className="grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,1)] transition-all duration-200 hover:bg-emerald-400 active:scale-90"
              >
                <Phone className="size-6" />
              </button>
              <span className="text-xs text-slate-500">Accept</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
