import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useAIStore } from "../store/useAIStore";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import AIPanel from "../components/AIPanel";
import AIChatConversation from "../components/AIChatConversation";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  const { authUser, resendVerification } = useAuthStore();
  const { isPanelOpen, closePanel } = useAIStore();

  useEffect(() => {
    if (!selectedUser && isPanelOpen) {
      closePanel();
    }
  }, [selectedUser, isPanelOpen, closePanel]);

  return (
    <div
      className={`h-full w-full transition-[max-width] duration-500 ease-out sm:h-[min(860px,100%)] ${
        isPanelOpen ? "max-w-[92rem]" : "max-w-6xl"
      }`}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden border-0 border-white/[0.08] bg-brand-surface-sidebar/80 backdrop-blur-2xl sm:rounded-3xl sm:border sm:shadow-shell">
        {/* ---------- UNVERIFIED EMAIL BANNER ---------- */}
        {authUser && !authUser.isEmailVerified && (
          <div className="z-30 flex items-center justify-between gap-3 border-b border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
            <span>Verify your email to start sending messages.</span>
            <button
              onClick={resendVerification}
              className="shrink-0 font-semibold underline transition-colors hover:text-amber-100"
            >
              Resend link
            </button>
          </div>
        )}

        <div className="relative flex min-h-0 flex-1">
          {/* Top light catch — makes the frame feel like glass, not a flat box */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            aria-hidden="true"
          />

          {/* ---------- LEFT SIDEBAR ---------- */}
          <aside
            className={`w-full shrink-0 flex-col border-white/[0.07] bg-black/25 sm:w-[22rem] sm:border-r lg:w-[24rem] ${
              selectedUser ? "hidden sm:flex" : "flex"
            }`}
          >
            <ProfileHeader />
            <ActiveTabSwitch />

            {/* List Container */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </div>
          </aside>

          {/* ---------- CENTER CHAT AREA ---------- */}
          <main
            className={`min-w-0 flex-1 flex-col bg-gradient-to-b from-transparent to-black/20 ${
              !selectedUser ? "hidden sm:flex" : "flex"
            }`}
          >
            {selectedUser?.isAIProfile ? (
              <AIChatConversation />
            ) : selectedUser ? (
              <ChatContainer />
            ) : (
              <NoConversationPlaceholder />
            )}
          </main>

          {/* ---------- AI PANEL ---------- */}
          {isPanelOpen && selectedUser && !selectedUser.isAIProfile && <AIPanel />}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
