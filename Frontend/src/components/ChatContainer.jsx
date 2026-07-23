import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { Reply, Edit3, Trash2, Smile, FileText, Download, Play, Music } from "lucide-react";

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
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [openReactionMsgId, setOpenReactionMsgId] = useState(null);
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

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8 bg-slate-950/20">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === authUser._id;
              const isEditing = editingMessageId === msg._id;

              return (
                <div
                  key={msg._id}
                  className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} group relative animate-fade-in-up`}
                  style={{
                    animationDelay: `${index * 20}ms`,
                  }}
                >
                  {/* Quoted replied message */}
                  {msg.replyTo && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 opacity-75 max-w-xs truncate bg-slate-900/60 p-1.5 rounded-lg border-l-2 border-amber-500/60">
                      <Reply className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="font-semibold text-amber-400">
                        {msg.replyTo.senderId === authUser._id ? "You" : selectedUser.fullName}:
                      </span>
                      <span className="truncate text-slate-350">{msg.replyTo.text || "Media"}</span>
                    </div>
                  )}

                  {/* Bubble + Action Controls wrapper - keeps the action bar pinned to the bubble */}
                  <div className="relative inline-block max-w-full">
                    {/* Message bubble */}
                    <div
                      className={`
                        chat-bubble relative overflow-hidden group/bubble
                        transition-all duration-300 ease-out text-left
                        ${
                          isOwnMessage
                            ? "bg-amber-500/20 text-amber-250 border border-amber-500/30 shadow-md"
                            : "bg-slate-900/80 text-slate-200 border border-slate-800/80 shadow-md"
                        }
                        hover:scale-[1.02] active:scale-95
                      `}
                    >
                      {/* Inner glow effect on hover */}
                      <div
                        className={`
                          absolute inset-0 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-300
                          ${isOwnMessage ? "bg-white/5" : "bg-slate-800/50"}
                        `}
                      />

                      {/* Content wrapper */}
                      <div className="relative z-10">
                        {/* Image Legacy Support */}
                        {msg.image && !msg.media && (
                          <img
                            src={msg.image}
                            alt="Shared"
                            className="rounded-lg max-h-48 object-cover shadow-md mb-2 animate-fade-in transition-transform duration-300 hover:scale-105"
                          />
                        )}

                        {/* Unified Media Player / Downloader */}
                        {msg.media && (
                          <div className="mb-2">
                            {msg.media.type === "image" && (
                              <img
                                src={msg.media.url}
                                alt={msg.media.name}
                                className="rounded-lg max-h-60 object-cover shadow-md transition-transform duration-300 hover:scale-105"
                              />
                            )}
                            {msg.media.type === "video" && (
                              <video
                                src={msg.media.url}
                                controls
                                className="max-w-xs rounded-lg shadow border border-slate-800"
                              />
                            )}
                            {msg.media.type === "audio" && (
                              <audio src={msg.media.url} controls className="max-w-xs" />
                            )}
                            {msg.media.type === "file" && (
                              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg max-w-xs">
                                <FileText className="w-8 h-8 text-amber-400" />
                                <div className="text-left flex-1 min-w-0">
                                  <p className="text-sm text-slate-200 font-medium truncate">{msg.media.name}</p>
                                  <p className="text-xs text-slate-450">{(msg.media.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <a
                                  href={msg.media.url}
                                  download={msg.media.name}
                                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-amber-400 transition"
                                  title="Download file"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Text content or Edit Input */}
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={() => handleSaveEdit(msg._id)}
                              className="text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-2 py-1 rounded text-amber-400 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 px-2 py-1 rounded text-slate-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          msg.text && (
                            <p className="leading-relaxed break-words text-sm">
                              {msg.text}
                            </p>
                          )
                        )}

                        {/* Timestamp & Status & Edit indicators */}
                        <p
                          className={`
                            text-[10px] mt-1.5 opacity-60 group-hover/bubble:opacity-100 transition-opacity duration-200
                            flex items-center gap-1
                            ${isOwnMessage ? "justify-end" : "justify-start"}
                          `}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {msg.isEdited && <span className="text-slate-500 italic font-light ml-1">(edited)</span>}
                          {isOwnMessage && (
                            <span
                              className="ml-1"
                              title={msg.readAt ? `Read at: ${new Date(msg.readAt).toLocaleTimeString()}` : "Delivered to device"}
                            >
                              {msg.status === "sent" && <span className="text-slate-500">✓</span>}
                              {msg.status === "delivered" && <span className="text-slate-500">✓✓</span>}
                              {msg.status === "read" && <span className="text-amber-400 font-bold">✓✓</span>}
                            </span>
                          )}
                        </p>

                        {/* Render emoji reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(
                              msg.reactions.reduce((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(msg._id, emoji)}
                                className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5 text-xs hover:bg-slate-800 transition text-slate-350"
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bubble Hover Action Controls - now anchored to the bubble wrapper, not the full chat row */}
                    {!msg.isDeleted && !isEditing && (
                      <div
                        className={`
                          absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity
                          flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 px-2 py-1 rounded-full shadow-xl z-30
                          ${isOwnMessage ? "-left-12 -translate-x-full" : "-right-12 translate-x-full"}
                        `}
                      >
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-amber-400 transition"
                          title="Reply"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>

                        {isOwnMessage && (
                          <>
                            <button
                              onClick={() => handleStartEdit(msg)}
                              className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-amber-400 transition"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(msg._id)}
                              className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-red-400 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Emoji quick reaction popover trigger (click-based, not hover-based) */}
                        <div
                          className="relative text-left"
                          ref={openReactionMsgId === msg._id ? reactionPopoverRef : null}
                        >
                          <button
                            onClick={() =>
                              setOpenReactionMsgId(openReactionMsgId === msg._id ? null : msg._id)
                            }
                            className={`p-1 rounded transition ${
                              openReactionMsgId === msg._id
                                ? "bg-slate-850 text-amber-400"
                                : "hover:bg-slate-850 text-slate-400 hover:text-amber-400"
                            }`}
                            title="React"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                          {openReactionMsgId === msg._id && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-950 border border-slate-800 p-1.5 rounded-full shadow-2xl z-40">
                              {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    reactToMessage(msg._id, emoji);
                                    setOpenReactionMsgId(null);
                                  }}
                                  className="hover:scale-125 transition duration-150 text-sm"
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
              );
            })}

            {/* Typing indicator bubble */}
            {typingUsers[selectedUser._id] && (
              <div className="chat chat-start animate-fade-in-up">
                <div className="chat-bubble bg-slate-900/80 text-slate-400 border border-slate-800/50 py-2.5 px-4 rounded-lg flex items-center gap-1.5">
                  <span className="text-xs font-medium">{selectedUser.fullName} is typing</span>
                  <div className="flex gap-0.5 items-center mt-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messageEndRef} className="h-2" />
          </div>
        ) : isMessagesLoading ? (
          <div className="animate-fade-in">
            <MessagesLoadingSkeleton />
          </div>
        ) : (
          <div className="animate-fade-in">
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          </div>
        )}
      </div>

      <MessageInput />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up,
          .animate-fade-in {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
export default ChatContainer;
