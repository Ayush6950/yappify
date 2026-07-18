import { useRef, useState, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  ImageIcon,
  SendIcon,
  XIcon,
  Smile,
  Paperclip,
  FileText,
  Play,
  Music,
  Reply,
} from "lucide-react";

const EMOJI_CATEGORIES = {
  "Smileys & Emotion": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤫", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🫠", "🫥", "😴", "🥱", "🤤", "😪", "😮‍🌫️", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"],
  "Gestures & People": ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸"],
  "Hearts & Activities": ["❤️", "🩷", "🧡", "💛", "💚", "💙", "🩵", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🏓", "🏸", "🏒", "🏹", "🎣", "🤿", "🥊", "🥋", "🛹", "🛼", "🏋️", "⛹️", "🤺", "🚴", "🧗", "🧘", "🏆", "🥇", "🥈", "🥉", "🏅", "🎫", "🎟️", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🎸", "🎺", "🎮", "🎲", "♟️"],
  "Travel & Food": ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚜", "🛵", "🏍️", "🚲", "🛺", "🚂", "✈️", "🚀", "🛸", "⛵", "⚓", "🍕", "🍔", "🍟", "🌭", "🍿", "🍳", "🧇", "🥞", "🍞", "🥐", "🥖", " pretzel", "🥯", "🥪", "🌮", "🌯", "🥗", "🍜", "🍝", "寿司", "🍤", "🍺", "🍷", "☕", "🥤"],
  "Symbols & Objects": ["🔑", "🗝️", "🔨", "🪓", "⛏️", "🔧", "⚙️", "🔩", "🧱", "🪚", "🪛", "⛓️", "🛒", "🧲", "🔫", "💣", "🧨", "🔮", "📿", "🧿", "🩹", "🩺", "🧪", "🧫", "🔬", "🔭", "📡", "🪞", "🪟", "🪠", "🎈", "🎉", "🎊", "🪄", "📸", "💻", "🖥️", "🖱️", "📚", "📕", "📖", "📄", "✉️", "📦", "🪙", "💰", "💳", "💎", "⏳", "⏰", "💡", "🔦", "🗑️", "💬", "💭", "💤"],
};

const applySkinTone = (emoji, tone) => {
  if (!tone) return emoji;
  const modifiable = ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦵", "🦶", "👂", "🦻", "👃"];
  if (modifiable.includes(emoji)) {
    return emoji + tone;
  }
  return emoji;
};

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [fileAttachment, setFileAttachment] = useState(null); // { name, size, type, url }
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [selectedSkinTone, setSelectedSkinTone] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const {
    sendMessage,
    isSoundEnabled,
    selectedUser,
    sendTypingStart,
    sendTypingEnd,
    replyingTo,
    setReplyingTo,
  } = useChatStore();

  const [recentEmojis, setRecentEmojis] = useState(() => {
    return JSON.parse(localStorage.getItem("recent_emojis")) || ["👍", "❤️", "😂", "😮", "😢", "🙏"];
  });

  const saveRecentEmoji = (emoji) => {
    const updated = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 12);
    setRecentEmojis(updated);
    localStorage.setItem("recent_emojis", JSON.stringify(updated));
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (!isTyping && selectedUser) {
      setIsTyping(true);
      sendTypingStart(selectedUser._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedUser) sendTypingEnd(selectedUser._id);
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !fileAttachment) return;

    setIsSending(true);
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    if (selectedUser) sendTypingEnd(selectedUser._id);

    try {
      await sendMessage({
        text: text.trim(),
        media: fileAttachment,
      });
      setText("");
      setFileAttachment(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsSending(false);
    }
  };

  const processFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB size limit");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      let type = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      setFileAttachment({
        name: file.name,
        size: file.size,
        type,
        url: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    saveRecentEmoji(emoji);
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const hasContent = text.trim() || fileAttachment;

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 via-slate-900 to-slate-900/50 backdrop-blur-sm transition-all ${
          isDragging ? "border-cyan-500 bg-cyan-950/20" : ""
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-cyan-950/30 backdrop-blur-sm z-50 pointer-events-none">
            <p className="text-cyan-400 font-medium">Drop your file here to upload</p>
          </div>
        )}

        {/* Reply Quote Preview */}
        {replyingTo && (
          <div className="max-w-3xl mx-auto mb-3 flex items-center justify-between bg-slate-800/80 border border-slate-700/50 rounded-lg p-3 animate-slide-up">
            <div className="flex items-center gap-3">
              <Reply className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <p className="text-xs text-cyan-400 font-semibold">Replying to message</p>
                <p className="text-sm text-slate-300 truncate max-w-lg">
                  {replyingTo.text || (replyingTo.media ? "Shared media file" : "Shared image")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Media / File Attachment Preview */}
        {fileAttachment && (
          <div className="max-w-3xl mx-auto mb-4 animate-slide-up text-left">
            <div className="relative group inline-block bg-slate-800 border border-slate-700/50 rounded-lg p-3 pr-10">
              <div className="flex items-center gap-3">
                {fileAttachment.type === "image" && (
                  <img
                    src={fileAttachment.url}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded border border-slate-700"
                  />
                )}
                {fileAttachment.type === "video" && (
                  <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center text-cyan-400">
                    <Play className="w-5 h-5" />
                  </div>
                )}
                {fileAttachment.type === "audio" && (
                  <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center text-cyan-400">
                    <Music className="w-5 h-5" />
                  </div>
                )}
                {fileAttachment.type === "file" && (
                  <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-200 font-medium truncate max-w-xs">{fileAttachment.name}</p>
                  <p className="text-xs text-slate-400">{(fileAttachment.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setFileAttachment(null)}
                className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all shadow"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50 w-72 h-80 bg-slate-950/95 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl p-3 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                placeholder="Search emojis..."
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex items-center gap-0.5 ml-2">
                {["", "🏻", "🏼", "🏽", "🏾", "🏿"].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedSkinTone(tone)}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border transition ${
                      selectedSkinTone === tone
                        ? "border-cyan-400 bg-slate-700"
                        : "border-transparent hover:bg-slate-800"
                    }`}
                    title={tone ? `Skin Tone ${tone}` : "Default Tone"}
                  >
                    {tone || "🫱"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 text-left space-y-3">
              {emojiSearch ? (
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Search Results
                  </h4>
                  <div className="grid grid-cols-6 gap-1">
                    {Object.values(EMOJI_CATEGORIES)
                      .flat()
                      .filter((emoji) => emoji.includes(emojiSearch) || emojiSearch === "")
                      .slice(0, 36)
                      .map((emoji) => {
                        const modifiedEmoji = applySkinTone(emoji, selectedSkinTone);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiClick(modifiedEmoji)}
                            className="text-lg hover:scale-125 transition active:scale-90"
                          >
                            {modifiedEmoji}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <>
                  {recentEmojis.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Recent
                      </h4>
                      <div className="grid grid-cols-6 gap-1">
                        {recentEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-lg hover:scale-125 transition active:scale-90"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.entries(EMOJI_CATEGORIES).map(([cat, list]) => (
                    <div key={cat}>
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        {cat}
                      </h4>
                      <div className="grid grid-cols-6 gap-1">
                        {list.slice(0, 18).map((emoji) => {
                          const modifiedEmoji = applySkinTone(emoji, selectedSkinTone);
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleEmojiClick(modifiedEmoji)}
                              className="text-lg hover:scale-125 transition active:scale-90"
                            >
                              {modifiedEmoji}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-end gap-3">
          {/* Emoji Picker Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 rounded-lg bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all ${
              showEmojiPicker ? "text-cyan-400 bg-cyan-950/20" : ""
            }`}
            title="Emoji picker"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Paperclip File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-lg bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative group">
            <div
              className={`absolute -inset-0.5 rounded-lg bg-gradient-to-r from-cyan-500/0 to-blue-500/0 transition-all duration-300 pointer-events-none blur ${
                isFocused ? "from-cyan-500/30 to-blue-500/30 opacity-100" : "opacity-0"
              }`}
            />

            <input
              type="text"
              value={text}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`relative w-full bg-slate-800/50 border-2 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 transition-all duration-300 focus:outline-none ${
                isFocused
                  ? "border-cyan-500/50 bg-slate-800/80 shadow-lg shadow-cyan-500/20"
                  : "border-slate-700/50 hover:border-slate-600/50"
              }`}
              placeholder="Type your message..."
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!hasContent || isSending}
            className={`relative px-4 py-3 rounded-lg font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-cyan-500/50 group disabled:cursor-not-allowed ${
              hasContent && !isSending
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:from-cyan-600 hover:to-cyan-700 active:scale-95"
                : "bg-slate-800/50 text-slate-500 opacity-50"
            }`}
            title={isSending ? "Sending..." : "Send message"}
          >
            <div
              className={`absolute -inset-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur ${
                hasContent && !isSending ? "bg-cyan-500/50" : ""
              }`}
            />

            <div className="relative flex items-center justify-center h-5 w-5">
              {isSending ? (
                <div className="w-4 h-4 border-2 border-cyan-200 border-t-white rounded-full animate-spin" />
              ) : (
                <SendIcon className="w-5 h-5 transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-active:scale-75" />
              )}
            </div>
          </button>
        </form>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

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