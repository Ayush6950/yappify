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
      <div className="flex-1 px-6 overflow-y-auto py-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900">
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
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 opacity-75 max-w-xs truncate bg-slate-800/40 p-1.5 rounded-lg border-l-2 border-cyan-500">
                      <Reply className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      <span className="font-semibold text-cyan-400">
                        {msg.replyTo.senderId === authUser._id ? "You" : selectedUser.fullName}:
                      </span>
                      <span className="truncate">{msg.replyTo.text || "Media"}</span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`
                      chat-bubble relative overflow-hidden group/bubble
                      transition-all duration-300 ease-out text-left
                      ${
                        isOwnMessage
                          ? "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                          : "bg-gradient-to-br from-slate-800 to-slate-900 text-slate-200 shadow-lg shadow-slate-800/40 hover:shadow-slate-700/60 border border-slate-700/50"
                      }
                      hover:scale-[1.02] active:scale-95
                    `}
                  >
                    {/* Inner glow effect on hover */}
                    <div
                      className={`
                        absolute inset-0 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-300
                        ${isOwnMessage ? "bg-cyan-400/10" : "bg-slate-400/5"}
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
                              className="max-w-xs rounded-lg shadow border border-slate-700"
                            />
                          )}
                          {msg.media.type === "audio" && (
                            <audio src={msg.media.url} controls className="max-w-xs" />
                          )}
                          {msg.media.type === "file" && (
                            <div className="flex items-center gap-3 bg-black/20 border border-slate-700/40 p-3 rounded-lg max-w-xs">
                              <FileText className="w-8 h-8 text-cyan-400" />
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-sm text-slate-200 font-medium truncate">{msg.media.name}</p>
                                <p className="text-xs text-slate-400">{(msg.media.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <a
                                href={msg.media.url}
                                download={msg.media.name}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-cyan-400 transition"
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
                            className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2 py-1 text-sm focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={() => handleSaveEdit(msg._id)}
                            className="text-xs bg-cyan-500 hover:bg-cyan-600 px-2 py-1 rounded text-white font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300"
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
                        {msg.isEdited && <span className="text-slate-400 italic font-light ml-1">(edited)</span>}
                        {isOwnMessage && (
                          <span
                            className="ml-1"
                            title={msg.readAt ? `Read at: ${new Date(msg.readAt).toLocaleTimeString()}` : "Delivered to device"}
                          >
                            {msg.status === "sent" && <span className="text-slate-400">✓</span>}
                            {msg.status === "delivered" && <span className="text-slate-400">✓✓</span>}
                            {msg.status === "read" && <span className="text-cyan-400 font-bold">✓✓</span>}
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
                              className="flex items-center gap-1 bg-black/30 border border-slate-700/40 rounded-full px-2 py-0.5 text-xs hover:bg-slate-800 transition"
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bubble Hover Action Controls */}
                  {!msg.isDeleted && !isEditing && (
                    <div
                      className={`
                        absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity
                        flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-1 rounded-full shadow-lg z-20
                        ${isOwnMessage ? "left-0 -translate-x-full -ml-3" : "right-0 translate-x-full -mr-3"}
                      `}
                    >
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition"
                        title="Reply"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>

                      {isOwnMessage && (
                        <>
                          <button
                            onClick={() => handleStartEdit(msg)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(msg._id)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {/* Emoji quick reaction popover trigger */}
                      <div className="relative group/react text-left">
                        <button
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-yellow-400 transition"
                          title="React"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/react:flex items-center gap-1 bg-slate-900 border border-slate-700 p-1.5 rounded-full shadow-2xl z-30">
                          {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => reactToMessage(msg._id, emoji)}
                              className="hover:scale-125 transition duration-150 text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator bubble */}
            {typingUsers[selectedUser._id] && (
              <div className="chat chat-start animate-fade-in-up">
                <div className="chat-bubble bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 border border-slate-700/50 py-2.5 px-4 rounded-lg flex items-center gap-1.5">
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