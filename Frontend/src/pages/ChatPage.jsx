
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
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
  const { isPanelOpen, closePanel } = useAIStore();

  useEffect(() => {
    if (!selectedUser && isPanelOpen) {
      closePanel();
    }
  }, [selectedUser, isPanelOpen, closePanel]);

  return (
    <div className={`w-full h-[800px] ${isPanelOpen ? "max-w-7xl" : "max-w-6xl"}`}>
      <div className="w-full h-full flex rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-96 flex flex-col border-r border-slate-800/80 bg-slate-900/20 shrink-0">
          <ProfileHeader />
          <ActiveTabSwitch />

          {/* List Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* CENTER CHAT AREA */}
        <div className="flex-1 flex flex-col bg-slate-950/30 min-w-0">
          {selectedUser?.isAIProfile ? <AIChatConversation /> : selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>

        {/* AI PANEL */}
        {isPanelOpen && selectedUser && !selectedUser.isAIProfile && <AIPanel />}
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ChatPage;
