import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  const tabs = [
    { id: "chats", label: "Chats" },
    { id: "contacts", label: "Contacts" },
  ];

  return (
    <div className="relative p-2 m-2">
      {/* Tab buttons container */}
      <div className="relative flex gap-1 bg-slate-950/60 rounded-lg p-1 border border-slate-800/80">
        {/* Animated active indicator background */}
        <div
          className="absolute top-1 bottom-1 rounded-md bg-slate-800/80 shadow-md transition-all duration-300 ease-out"
          style={{
            left: activeTab === "chats" ? "0.25rem" : "calc(50% + 0.25rem)",
            width: "calc(50% - 0.5rem)",
          }}
        />

        {/* Tab buttons */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex-1 py-2 px-4 rounded-md font-semibold text-sm
              transition-all duration-200 ease-out
              ${
                activeTab === tab.id
                  ? "text-amber-400"
                  : "text-slate-400 hover:text-slate-300"
              }
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-amber-500/50
            `}
          >
            {/* Text */}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ActiveTabSwitch;