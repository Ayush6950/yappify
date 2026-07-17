import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);

  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    
    setIsSending(true);
    if (isSoundEnabled) playRandomKeyStrokeSound();

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
      setText("");
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsSending(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasContent = text.trim() || imagePreview;

  return (
    <>
      <div className="relative p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 via-slate-900 to-slate-900/50 backdrop-blur-sm">
        {/* Image Preview Section */}
        {imagePreview && (
          <div className="max-w-3xl mx-auto mb-4 animate-slide-up">
            <div className="relative group inline-block">
              {/* Preview image with glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="
                    w-24 h-24 object-cover rounded-lg border-2 border-slate-700/50
                    shadow-lg shadow-cyan-500/20 transition-all duration-300
                    group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/40
                  "
                />

                {/* Remove button with animation */}
                <button
                  onClick={removeImage}
                  className={`
                    absolute -top-3 -right-3 w-7 h-7 rounded-full
                    bg-gradient-to-br from-red-500 to-red-600
                    flex items-center justify-center text-white
                    transition-all duration-200 ease-out
                    hover:scale-110 active:scale-95
                    shadow-lg shadow-red-500/40
                    focus:outline-none focus:ring-2 focus:ring-red-500/50
                  `}
                  type="button"
                  title="Remove image"
                >
                  <XIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
                </button>

                {/* Preview label */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                  <span className="text-xs text-slate-200 font-medium">Ready to send</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-end gap-3">
          {/* Text Input */}
          <div className="flex-1 relative group">
            {/* Animated focus border */}
            <div
              className={`
                absolute -inset-0.5 rounded-lg bg-gradient-to-r from-cyan-500/0 to-blue-500/0
                transition-all duration-300 pointer-events-none blur
                ${isFocused ? "from-cyan-500/30 to-blue-500/30 opacity-100" : "opacity-0"}
              `}
            />

            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                isSoundEnabled && playRandomKeyStrokeSound();
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                relative w-full bg-slate-800/50 border-2 rounded-lg py-3 px-4
                text-slate-100 placeholder-slate-500 transition-all duration-300
                focus:outline-none
                ${
                  isFocused
                    ? "border-cyan-500/50 bg-slate-800/80 shadow-lg shadow-cyan-500/20"
                    : "border-slate-700/50 hover:border-slate-600/50"
                }
              `}
              placeholder="Type your message..."
            />
          </div>

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative p-3 rounded-lg transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              group
              ${
                imagePreview
                  ? "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }
            `}
            title="Attach image"
          >
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-cyan-400/10" />
            <ImageIcon className={`
              w-5 h-5 relative transition-all duration-200
              ${imagePreview ? "scale-110" : "group-hover:scale-110"}
              group-active:scale-95
            `} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!hasContent || isSending}
            className={`
              relative px-4 py-3 rounded-lg font-medium
              transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              group disabled:cursor-not-allowed
              ${
                hasContent && !isSending
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:from-cyan-600 hover:to-cyan-700 active:scale-95"
                  : "bg-slate-800/50 text-slate-500 opacity-50"
              }
            `}
            title={isSending ? "Sending..." : "Send message"}
          >
            {/* Button glow effect */}
            <div
              className={`
                absolute -inset-1 rounded-lg opacity-0 group-hover:opacity-100
                transition-opacity duration-300 blur
                ${hasContent && !isSending ? "bg-cyan-500/50" : ""}
              `}
            />

            {/* Animated send icon */}
            <div className="relative flex items-center justify-center h-5 w-5">
              {isSending ? (
                <div className="w-4 h-4 border-2 border-cyan-200 border-t-white rounded-full animate-spin" />
              ) : (
                <SendIcon className={`
                  w-5 h-5 transition-all duration-200
                  group-hover:translate-x-1 group-hover:-translate-y-1
                  group-active:scale-75
                `} />
              )}
            </div>
          </button>
        </form>

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }

        .animate-spin {
          animation: spin 0.8s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up,
          .animate-spin {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </>
  );
}

export default MessageInput;