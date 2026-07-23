
import { useChatStore } from "../store/useChatStore";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="w-full max-w-6xl h-[800px]">
      <div className="w-full h-full flex rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-96 flex flex-col border-r border-slate-800/80 bg-slate-900/20">
          <ProfileHeader />
          <ActiveTabSwitch />

          {/* List Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="flex-1 flex flex-col bg-slate-950/30">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
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
