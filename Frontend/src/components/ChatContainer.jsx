import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import Avatar from "./Avatar";
import {
  Reply,
  Edit3,
  Trash2,
  Smile,
  FileText,
  Download,
  Languages,
  Code2,
  Check,
  CheckCheck,
  Clock,
  ChevronDown,
  Ban,
} from "lucide-react";
import { useAIStore } from "../store/useAIStore";
import { hasCodeContent } from "../lib/aiUtils";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

/** Messages within this window from the same sender render as one visual group. */
const GROUPING_WINDOW_MS = 5 * 60 * 1000;

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function formatDayLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  const isThisYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(isThisYear ? {} : { year: "numeric" }),
  });
}

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    editMessage,
    deleteMessage,
    reactToMessage,
    setReplyingTo,
  } = useChatStore();
  const { openPanelWithMessage } = useAIStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const scrollRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [openReactionMsgId, setOpenReactionMsgId] = useState(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const reactionPopoverRef = useRef(null);

  // Close the emoji popover when clicking anywhere outside it
  useEffect(() => {
    if (!openReactionMsgId) return;

    const handleClickOutside = (e) => {
      if (reactionPopoverRef.current && !reactionPopoverRef.current.contains(e.target)) {
        setOpenReactionMsgId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [openReactionMsgId]);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsers]);

  // Show a "jump to latest" affordance once the reader scrolls away from the bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJumpToLatest(distanceFromBottom > 240);
  }, []);

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditingText(msg.text);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    await editMessage(msgId, editingText.trim());
    setEditingMessageId(null);
  };

  const handleDelete = async (msgId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(msgId);
    }
  };

  const renderStatus = (msg) => {
    if (msg.status === "read") return <CheckCheck className="size-3.5 text-indigo-300" />;
    if (msg.status === "delivered") return <CheckCheck className="size-3.5 text-slate-500" />;
    if (msg.status === "sent") return <Check className="size-3.5 text-slate-500" />;
    return <Clock className="size-3 text-slate-600" />;
  };

  return (
    <>
      <ChatHeader />

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-3 py-6 sm:px-6"
        >
          {isMessagesLoading ? (
            <MessagesLoadingSkeleton />
          ) : messages.length > 0 ? (
            <div className="mx-auto max-w-3xl">
              {messages.map((msg, index) => {
                const isOwnMessage = msg.senderId === authUser._id;
                const isEditing = editingMessageId === msg._id;

                const prev = messages[index - 1];
                const next = messages[index + 1];
                const createdAt = new Date(msg.createdAt);

                const showDayDivider =
                  !prev || !isSameDay(new Date(prev.createdAt), createdAt);

                const startsGroup =
                  showDayDivider ||
                  !prev ||
                  prev.senderId !== msg.senderId ||
                  createdAt - new Date(prev.createdAt) > GROUPING_WINDOW_MS;

                const endsGroup =
                  !next ||
                  next.senderId !== msg.senderId ||
                  !isSameDay(new Date(next.createdAt), createdAt) ||
                  new Date(next.createdAt) - createdAt > GROUPING_WINDOW_MS;

                return (
                  <div key={msg._id}>
                    {/* ---------- Day divider ---------- */}
                    {showDayDivider && (
                      <div className="my-6 flex items-center gap-3 first:mt-0">
                        <span className="h-px flex-1 bg-white/[0.07]" />
                        <span className="rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-400">
                          {formatDayLabel(createdAt)}
                        </span>
                        <span className="h-px flex-1 bg-white/[0.07]" />
                      </div>
                    )}

                    <div
                      className={`group flex items-end gap-2 ${endsGroup ? "mb-3" : "mb-0.5"} ${
                        isOwnMessage ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Incoming avatar — only on the last message of a run */}
                      {!isOwnMessage && (
                        <div className="w-7 shrink-0">
                          {endsGroup && (
                            <Avatar
                              src={selectedUser.profilePic}
                              alt={selectedUser.fullName}
                              size={28}
                              showPresence={false}
                            />
                          )}
                        </div>
                      )}

                      <div
                        className={`relative flex min-w-0 max-w-[85%] flex-col sm:max-w-[70%] ${
                          isOwnMessage ? "items-end" : "items-start"
                        }`}
                      >
                        {/* ---------- Quoted reply ---------- */}
                        {msg.replyTo && (
                          <div className="mb-1 flex max-w-full items-center gap-1.5 rounded-lg border-l-2 border-indigo-400/60 bg-white/[0.04] px-2 py-1.5 text-xs">
                            <Reply className="size-3 shrink-0 text-indigo-400" />
                            <span className="shrink-0 font-semibold text-indigo-300">
                              {msg.replyTo.senderId === authUser._id ? "You" : selectedUser.fullName}
                            </span>
                            <span className="truncate text-slate-400">
                              {msg.replyTo.text || "Media"}
                            </span>
                          </div>
                        )}

                        {/* ---------- Bubble ---------- */}
                        <div
                          className={`relative w-fit max-w-full px-3.5 py-2.5 text-left shadow-soft transition-colors duration-200 ${
                            msg.isDeleted
                              ? "rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] text-slate-500"
                              : isOwnMessage
                                ? "rounded-2xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/25 to-violet-500/15 text-indigo-50"
                                : "rounded-2xl border border-white/[0.07] bg-brand-surface-card text-slate-200"
                          } ${
                            !msg.isDeleted && !startsGroup
                              ? isOwnMessage
                                ? "rounded-tr-md"
                                : "rounded-tl-md"
                              : ""
                          } ${
                            !msg.isDeleted && !endsGroup
                              ? isOwnMessage
                                ? "rounded-br-md"
                                : "rounded-bl-md"
                              : ""
                          }`}
                        >
                          {msg.isDeleted ? (
                            <p className="flex items-center gap-2 text-sm italic">
                              <Ban className="size-3.5" />
                              This message was deleted
                            </p>
                          ) : (
                            <>
                              {/* Legacy image field */}
                              {msg.image && !msg.media && (
                                <img
                                  src={msg.image}
                                  alt="Shared"
                                  className="mb-2 max-h-64 rounded-xl border border-white/[0.07] object-cover"
                                />
                              )}

                              {/* Unified media */}
                              {msg.media && (
                                <div className="mb-2">
                                  {msg.media.type === "image" && (
                                    <img
                                      src={msg.media.url}
                                      alt={msg.media.name}
                                      className="max-h-72 rounded-xl border border-white/[0.07] object-cover"
                                    />
                                  )}
                                  {msg.media.type === "video" && (
                                    <video
                                      src={msg.media.url}
                                      controls
                                      className="max-h-72 max-w-xs rounded-xl border border-white/[0.07]"
                                    />
                                  )}
                                  {msg.media.type === "audio" && (
                                    <audio src={msg.media.url} controls className="w-64 max-w-full" />
                                  )}
                                  {msg.media.type === "file" && (
                                    <div className="flex max-w-xs items-center gap-3 rounded-xl border border-white/[0.08] bg-black/30 p-2.5">
                                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                                        <FileText className="size-5" />
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-slate-100">
                                          {msg.media.name}
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                          {(msg.media.size / 1024).toFixed(1)} KB
                                        </span>
                                      </span>
                                      <a
                                        href={msg.media.url}
                                        download={msg.media.name}
                                        className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-indigo-300 transition-colors hover:bg-white/[0.1] hover:text-indigo-200"
                                        title="Download file"
                                      >
                                        <Download className="size-4" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {isEditing ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveEdit(msg._id);
                                      if (e.key === "Escape") setEditingMessageId(null);
                                    }}
                                    className="min-w-0 flex-1 rounded-lg border border-white/[0.1] bg-black/40 px-2.5 py-1.5 text-sm text-slate-100 focus:border-indigo-400/60 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleSaveEdit(msg._id)}
                                    className="rounded-lg border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-1.5 text-xs font-semibold text-indigo-200 transition-colors hover:bg-indigo-500/30"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingMessageId(null)}
                                    className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.08]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                msg.text && (
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {msg.text}
                                  </p>
                                )
                              )}
                            </>
                          )}

                          {/* ---------- Meta line ---------- */}
                          <div
                            className={`mt-1 flex items-center gap-1 text-[10px] text-slate-500 ${
                              isOwnMessage ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>
                              {createdAt.toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {msg.isEdited && !msg.isDeleted && <span className="italic">edited</span>}
                            {isOwnMessage && !msg.isDeleted && (
                              <span
                                className="ml-0.5 flex items-center"
                                title={
                                  msg.readAt
                                    ? `Read at ${new Date(msg.readAt).toLocaleTimeString()}`
                                    : "Delivered"
                                }
                              >
                                {renderStatus(msg)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ---------- Reactions ---------- */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div
                            className={`-mt-1.5 flex flex-wrap gap-1 ${
                              isOwnMessage ? "justify-end" : "justify-start"
                            }`}
                          >
                            {Object.entries(
                              msg.reactions.reduce((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(msg._id, emoji)}
                                className="flex items-center gap-1 rounded-full border border-white/[0.1] bg-brand-surface-card px-2 py-0.5 text-xs shadow-soft transition-transform hover:scale-110"
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px] font-semibold text-slate-400">{count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* ---------- Hover actions ---------- */}
                        {!msg.isDeleted && !isEditing && (
                          <div
                            className={`pointer-events-none absolute -top-4 z-30 flex items-center gap-0.5 rounded-full border border-white/[0.1] bg-brand-surface-card/95 p-1 opacity-0 shadow-raised backdrop-blur-xl transition-opacity duration-150 focus-within:pointer-events-auto focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 ${
                              isOwnMessage ? "right-2" : "left-2"
                            }`}
                          >
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-indigo-300"
                              title="Reply"
                            >
                              <Reply className="size-3.5" />
                            </button>

                            {msg.text && (
                              <button
                                onClick={() => openPanelWithMessage(msg, "translate")}
                                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-violet-300"
                                title="Translate with AI"
                              >
                                <Languages className="size-3.5" />
                              </button>
                            )}

                            {hasCodeContent(msg.text, msg.media?.name) && (
                              <button
                                onClick={() => openPanelWithMessage(msg, "explain-code")}
                                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-violet-300"
                                title="Explain code"
                              >
                                <Code2 className="size-3.5" />
                              </button>
                            )}

                            {isOwnMessage && (
                              <>
                                <button
                                  onClick={() => handleStartEdit(msg)}
                                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-indigo-300"
                                  title="Edit"
                                >
                                  <Edit3 className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(msg._id)}
                                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
                                  title="Delete"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </>
                            )}

                            <div
                              className="relative"
                              ref={openReactionMsgId === msg._id ? reactionPopoverRef : null}
                            >
                              <button
                                onClick={() =>
                                  setOpenReactionMsgId(openReactionMsgId === msg._id ? null : msg._id)
                                }
                                className={`rounded-full p-1.5 transition-colors ${
                                  openReactionMsgId === msg._id
                                    ? "bg-white/[0.1] text-indigo-300"
                                    : "text-slate-400 hover:bg-white/[0.08] hover:text-indigo-300"
                                }`}
                                title="React"
                              >
                                <Smile className="size-3.5" />
                              </button>

                              {openReactionMsgId === msg._id && (
                                <div
                                  className={`absolute bottom-[calc(100%+0.5rem)] z-40 flex items-center gap-1 rounded-full border border-white/[0.1] bg-brand-surface-card p-1.5 shadow-raised animate-pop-in ${
                                    isOwnMessage ? "right-0" : "left-0"
                                  }`}
                                >
                                  {QUICK_REACTIONS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        reactToMessage(msg._id, emoji);
                                        setOpenReactionMsgId(null);
                                      }}
                                      className="rounded-full p-1 text-base transition-transform duration-150 hover:scale-125"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ---------- Typing indicator ---------- */}
              {typingUsers[selectedUser._id] && (
                <div className="flex items-end gap-2 animate-fade-in">
                  <Avatar
                    src={selectedUser.profilePic}
                    alt={selectedUser.fullName}
                    size={28}
                    showPresence={false}
                  />
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/[0.07] bg-brand-surface-card px-3.5 py-3">
                    <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messageEndRef} className="h-2" />
            </div>
          ) : (
            <div className="animate-fade-in">
              <NoChatHistoryPlaceholder name={selectedUser.fullName} />
            </div>
          )}
        </div>

        {/* ---------- Jump to latest ---------- */}
        {showJumpToLatest && (
          <button
            onClick={() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/[0.1] bg-brand-surface-card/95 py-2 pl-3 pr-3.5 text-xs font-medium text-slate-300 shadow-raised backdrop-blur-xl transition-all hover:text-slate-50 animate-pop-in"
            title="Jump to latest messages"
          >
            <ChevronDown className="size-4" />
            Latest
          </button>
        )}
      </div>

      <MessageInput />
    </>
  );
}
export default ChatContainer;
