import { useRef, useState, useEffect, useCallback } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import {
  SendIcon,
  XIcon,
  Smile,
  Paperclip,
  FileText,
  Play,
  Music,
  Reply,
  UploadCloud,
} from "lucide-react";

const EMOJI_CATEGORIES = {
  "Smileys & Emotion": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🫨", "🫠", "🫥", "😴", "🥱", "🤤", "😪", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"],
  "Gestures & People": ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸"],
  "Hearts & Activities": ["❤️", "🩷", "🧡", "💛", "💚", "💙", "🩵", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🏓", "🏸", "🏒", "🏹", "🎣", "🤿", "🥊", "🥋", "🛹", "🛼", "🏋️", "⛹️", "🤺", "🚴", "🧗", "🧘", "🏆", "🥇", "🥈", "🥉", "🏅", "🎫", "🎟️", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🎸", "🎺", "🎮", "🎲", "♟️"],
  "Travel & Food": ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚜", "🛵", "🏍️", "🚲", "🛺", "🚂", "✈️", "🚀", "🛸", "⛵", "⚓", "🍕", "🍔", "🍟", "🌭", "🍿", "🍳", "🧇", "🥞", "🍞", "🥐", "🥖", "🥨", "🥯", "🥪", "🌮", "🌯", "🥗", "🍜", "🍝", "🍣", "🍤", "🍺", "🍷", "☕", "🥤"],
  "Symbols & Objects": ["🔑", "🗝️", "🔨", "🪓", "⛏️", "🔧", "⚙️", "🔩", "🧱", "🪚", "🪛", "⛓️", "🛒", "🧲", "💣", "🧨", "🔮", "📿", "🧿", "🩹", "🩺", "🧪", "🧫", "🔬", "🔭", "📡", "🪞", "🪟", "🪠", "🎈", "🎉", "🎊", "🪄", "📸", "💻", "🖥️", "🖱️", "📚", "📕", "📖", "📄", "✉️", "📦", "🪙", "💰", "💳", "💎", "⏳", "⏰", "💡", "🔦", "🗑️", "💬", "💭", "💤"],
};

const SKIN_TONES = ["", "🏻", "🏼", "🏽", "🏾", "🏿"];

const TONE_MODIFIABLE = new Set([
  "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙",
  "👈", "👉", "👆", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐",
  "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦵", "🦶", "👂", "🦻", "👃",
]);

const applySkinTone = (emoji, tone) =>
  tone && TONE_MODIFIABLE.has(emoji) ? emoji + tone : emoji;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [fileAttachment, setFileAttachment] = useState(null); // { name, size, type, url }
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [selectedSkinTone, setSelectedSkinTone] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
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
    draftMessage,
    clearDraftMessage,
  } = useChatStore();

  /** Keep the composer height matched to its content, up to a ceiling. */
  const autoGrow = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    autoGrow();
  }, [text, autoGrow]);

  // Sync AI draft into composer
  useEffect(() => {
    if (draftMessage) {
      setText(draftMessage);
      clearDraftMessage();
      inputRef.current?.focus();
    }
  }, [draftMessage, clearDraftMessage]);

  // Focus the composer when a reply is queued up
  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  // Dismiss the emoji picker on outside click / Escape
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    const handleEsc = (e) => e.key === "Escape" && setShowEmojiPicker(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showEmojiPicker]);

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

  // Enter sends, Shift+Enter inserts a newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const processFile = (file) => {
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File exceeds the 10MB size limit");
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
    inputRef.current?.focus();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    // Ignore drags moving between children of the drop zone
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const hasContent = text.trim() || fileAttachment;

  // Emoji search matches on category name — the only text we actually have per emoji
  const query = emojiSearch.trim().toLowerCase();
  const visibleCategories = query
    ? Object.entries(EMOJI_CATEGORIES).filter(([name]) => name.toLowerCase().includes(query))
    : Object.entries(EMOJI_CATEGORIES);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-none border-t border-white/[0.07] bg-black/25 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4"
    >
      {/* ---------- Drop target ---------- */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-2 z-50 grid place-items-center rounded-2xl border-2 border-dashed border-indigo-400/60 bg-indigo-500/10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-indigo-200">
            <UploadCloud className="size-7" />
            <p className="text-sm font-medium">Drop to attach</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {/* ---------- Reply preview ---------- */}
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border-l-2 border-indigo-400 bg-white/[0.04] py-2 pl-3 pr-2 animate-slide-up">
            <div className="flex min-w-0 items-center gap-2.5">
              <Reply className="size-4 shrink-0 text-indigo-400" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-indigo-300">Replying to message</p>
                <p className="truncate text-sm text-slate-400">
                  {replyingTo.text || (replyingTo.media ? "Shared media file" : "Shared image")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
              title="Cancel reply"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        )}

        {/* ---------- Attachment preview ---------- */}
        {fileAttachment && (
          <div className="mb-2 animate-slide-up">
            <div className="relative inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 pr-10">
              {fileAttachment.type === "image" ? (
                <img
                  src={fileAttachment.url}
                  alt="Preview"
                  className="size-11 rounded-lg border border-white/[0.08] object-cover"
                />
              ) : (
                <span className="grid size-11 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                  {fileAttachment.type === "video" && <Play className="size-5" />}
                  {fileAttachment.type === "audio" && <Music className="size-5" />}
                  {fileAttachment.type === "file" && <FileText className="size-5" />}
                </span>
              )}
              <div className="min-w-0">
                <p className="max-w-[16rem] truncate text-sm font-medium text-slate-100">
                  {fileAttachment.name}
                </p>
                <p className="text-xs text-slate-500">{(fileAttachment.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => setFileAttachment(null)}
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-white/[0.08] text-slate-300 transition-colors hover:bg-red-500 hover:text-white"
                title="Remove attachment"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ---------- Emoji picker ---------- */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-full left-2 right-2 z-50 mb-2 flex h-80 flex-col rounded-2xl border border-white/[0.09] bg-brand-surface-card/95 p-3 shadow-raised backdrop-blur-2xl animate-slide-up sm:left-4 sm:right-auto sm:w-80"
          >
            <div className="mb-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter categories..."
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-400/60 focus:outline-none"
              />
              <div className="flex shrink-0 items-center gap-0.5">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone || "default"}
                    onClick={() => setSelectedSkinTone(tone)}
                    className={`grid size-5 place-items-center rounded-full border text-[10px] transition ${
                      selectedSkinTone === tone
                        ? "border-indigo-400/70 bg-indigo-500/20"
                        : "border-transparent hover:bg-white/[0.07]"
                    }`}
                    title={tone ? "Skin tone" : "Default tone"}
                  >
                    {tone || "🫱"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-left">
              {!query && recentEmojis.length > 0 && (
                <div>
                  <h4 className="label-caps mb-1.5">Recent</h4>
                  <div className="grid grid-cols-8 gap-0.5">
                    {recentEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="rounded-lg py-1 text-lg transition hover:scale-125 hover:bg-white/[0.06] active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visibleCategories.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">
                  No category matches &ldquo;{emojiSearch}&rdquo;
                </p>
              ) : (
                visibleCategories.map(([cat, list]) => (
                  <div key={cat}>
                    <h4 className="label-caps mb-1.5">{cat}</h4>
                    <div className="grid grid-cols-8 gap-0.5">
                      {list.map((emoji) => {
                        const modifiedEmoji = applySkinTone(emoji, selectedSkinTone);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiClick(modifiedEmoji)}
                            className="rounded-lg py-1 text-lg transition hover:scale-125 hover:bg-white/[0.06] active:scale-90"
                          >
                            {modifiedEmoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ---------- Composer ---------- */}
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex flex-1 items-end gap-1 rounded-2xl border border-white/[0.08] bg-black/30 p-1.5 transition-all duration-200 focus-within:border-indigo-400/50 focus-within:bg-black/45 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`icon-btn shrink-0 ${showEmojiPicker ? "icon-btn-active" : ""}`}
              title="Emoji"
            >
              <Smile className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="icon-btn shrink-0"
              title="Attach file"
            >
              <Paperclip className="size-5" />
            </button>

            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="max-h-40 min-w-0 flex-1 resize-none self-center bg-transparent px-1 py-2 text-sm leading-relaxed text-slate-100 placeholder-slate-500 outline-none scrollbar-none"
            />
          </div>

          <button
            type="submit"
            disabled={!hasContent || isSending}
            className={`grid size-[46px] shrink-0 place-items-center rounded-2xl transition-all duration-300 ${
              hasContent && !isSending
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow hover:from-indigo-400 hover:to-violet-500 active:scale-90"
                : "cursor-not-allowed border border-white/[0.06] bg-white/[0.03] text-slate-600"
            }`}
            title={isSending ? "Sending..." : "Send message"}
          >
            {isSending ? (
              <span className="size-[18px] rounded-full border-2 border-white/30 border-t-white animate-spin-fast" />
            ) : (
              <SendIcon className="size-[18px]" />
            )}
          </button>
        </form>

        <p className="mt-1.5 hidden px-1 text-[10px] text-slate-600 sm:block">
          <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1 font-sans">Enter</kbd> to
          send &nbsp;·&nbsp;
          <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1 font-sans">Shift</kbd>
          +
          <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1 font-sans">Enter</kbd> for
          a new line
        </p>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
    </div>
  );
}

export default MessageInput;
