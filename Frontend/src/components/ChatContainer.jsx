import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === authUser._id;
              return (
                <div
                  key={msg._id}
                  className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} animate-fade-in-up`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Message bubble */}
                  <div
                    className={`
                      chat-bubble group relative overflow-hidden
                      transition-all duration-300 ease-out
                      ${
                        isOwnMessage
                          ? "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                          : "bg-gradient-to-br from-slate-800 to-slate-900 text-slate-200 shadow-lg shadow-slate-800/40 hover:shadow-slate-700/60 border border-slate-700/50"
                      }
                      hover:scale-105 hover:-translate-y-1
                      active:scale-95
                    `}
                  >
                    {/* Inner glow effect on hover */}
                    <div
                      className={`
                        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        ${isOwnMessage ? "bg-cyan-400/10" : "bg-slate-400/5"}
                      `}
                    />

                    {/* Content wrapper */}
                    <div className="relative z-10">
                      {/* Image with fade-in animation */}
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-lg h-48 object-cover shadow-md animate-fade-in transition-transform duration-300 group-hover:scale-105"
                        />
                      )}

                      {/* Text content */}
                      {msg.text && (
                        <p className={`${msg.image ? "mt-2" : ""} leading-relaxed break-words`}>
                          {msg.text}
                        </p>
                      )}

                      {/* Timestamp with fade effect */}
                      <p
                        className={`
                          text-xs mt-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200
                          flex items-center gap-1
                          ${isOwnMessage ? "justify-end" : "justify-start"}
                        `}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isOwnMessage && (
                          <span className="text-cyan-300 ml-1">✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

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

      {/* Add these keyframe animations to your global CSS or a Tailwind config */}
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