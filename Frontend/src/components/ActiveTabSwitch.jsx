import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  const tabs = [
    { id: "chats", label: "Chats" },
    { id: "contacts", label: "Contacts" },
  ];

  return (
    <div className="relative p-2 m-2">
      {/* Animated background blur container */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/5 to-blue-500/5 backdrop-blur-sm pointer-events-none" />

      {/* Tab buttons container */}
      <div className="relative flex gap-1 bg-slate-800/30 rounded-lg p-1 border border-slate-700/50 backdrop-blur-md">
        {/* Animated active indicator background */}
        <div
          className="absolute top-1 bottom-1 rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 transition-all duration-300 ease-out"
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
              relative flex-1 py-2 px-4 rounded-md font-medium text-sm
              transition-all duration-200 ease-out
              ${
                activeTab === tab.id
                  ? "text-cyan-300 shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-300"
              }
              hover:bg-slate-700/30 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
            `}
          >
            {/* Hover glow effect */}
            <span
              className={`
                absolute inset-0 rounded-md opacity-0 transition-opacity duration-300
                ${activeTab === tab.id ? "opacity-100" : "group-hover:opacity-20"}
              `}
              style={{
                background: "radial-gradient(circle at center, rgba(34, 211, 238, 0.1), transparent 70%)",
              }}
            />

            {/* Text with animation */}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Optional: Ambient glow effect */}
      <div className="absolute -inset-4 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 pointer-events-none blur-xl" />
    </div>
  );
}

export default ActiveTabSwitch;