import { useEffect, useRef } from "react";
import { Phone, XIcon } from "lucide-react";
import { PhoneOff } from "lucide-react";

const VideoPreview = ({ onClose }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

 return (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="relative bg-slate-900 rounded-2xl p-4 border border-slate-700">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-[700px] rounded-xl bg-black"
      />

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600
                     flex items-center justify-center
                     shadow-xl transition-all duration-200
                     hover:scale-110 active:scale-95"
        >
          <PhoneOff size={28} className="text-white rotate-[135deg]" />
        </button>
      </div>

    </div>
  </div>
);
};
export default VideoPreview;