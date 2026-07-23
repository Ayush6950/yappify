import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-transparent">
      <div className="size-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 mb-6">
        <MessageCircleIcon className="size-10 text-amber-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-300 mb-2">Select a conversation</h3>
      <p className="text-slate-500 max-w-md">
        Choose a contact from the sidebar to start chatting or continue a previous conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;