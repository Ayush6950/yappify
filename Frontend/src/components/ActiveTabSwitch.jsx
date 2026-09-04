import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab, unreadCounts } = useChatStore();

  const totalUnread = Object.values(unreadCounts || {}).reduce((sum, n) => sum + n, 0);

  const tabs = [
    { id: "chats", label: "Chats", badge: totalUnread },
    { id: "contacts", label: "Contacts", badge: 0 },
  ];

  return (
    <div className="px-3 pb-1 pt-3">
      <div
        role="tablist"
        className="relative flex rounded-xl border border-white/[0.07] bg-black/30 p-1"
      >
        {/* Sliding indicator */}
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-lg border border-indigo-400/25 bg-indigo-500/15 shadow-[0_2px_12px_-4px_rgba(99,102,241,0.8)] transition-[left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: activeTab === "chats" ? "0.25rem" : "calc(50% + 0.125rem)",
            width: "calc(50% - 0.375rem)",
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors duration-200 ${
                isActive ? "text-indigo-200" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="grid h-4 min-w-[1rem] place-items-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold leading-none text-white">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ActiveTabSwitch;
