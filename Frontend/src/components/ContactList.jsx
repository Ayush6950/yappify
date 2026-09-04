import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import SidebarSearch from "./SidebarSearch";
import Avatar from "./Avatar";
import { useAuthStore } from "../store/useAuthStore";
import { UserPlus, VolumeXIcon, Users, Check, X } from "lucide-react";

function ContactList() {
  const {
    getAllContacts,
    sendContactRequest,
    acceptContactRequest,
    rejectContactRequest,
    allContacts,
    setSelectedUser,
    selectedUser,
    isUsersLoading,
    mutedUsers,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getAllContacts(searchQuery);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, getAllContacts]);

  const filteredContacts = allContacts.filter((contact) => {
    const searchValue = searchQuery.trim().toLowerCase();
    if (!searchValue) return true;

    return (
      contact.fullName?.toLowerCase().includes(searchValue) ||
      contact.email?.toLowerCase().includes(searchValue)
    );
  });

  return (
    <>
      <SidebarSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name or email"
      />

      {isUsersLoading ? (
        <UsersLoadingSkeleton />
      ) : filteredContacts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.02] px-5 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-full border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
            <Users className="size-6" />
          </span>
          <p className="text-sm font-medium text-slate-300">
            {searchQuery ? "No one found" : "Find people to chat with"}
          </p>
          <p className="max-w-[16rem] text-xs leading-relaxed text-slate-500">
            {searchQuery
              ? "No user matches that name or email address."
              : "Search by name or email address to send your first chat request."}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredContacts.map((contact) => {
            const isMuted = mutedUsers.includes(contact._id);
            const requestStatus = contact.requestStatus || "none";
            const isActive = selectedUser?._id === contact._id;
            const isOnline = onlineUsers.includes(contact._id);

            return (
              <div
                key={contact._id}
                className={`group relative flex items-center justify-between gap-3 rounded-2xl border p-2.5 transition-all duration-200 ${
                  isActive
                    ? "border-indigo-400/30 bg-indigo-500/[0.12]"
                    : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-indigo-400" aria-hidden="true" />
                )}

                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => setSelectedUser(contact)}
                >
                  <Avatar src={contact.profilePic} alt={contact.fullName} size={44} online={isOnline} />

                  <div className="min-w-0 flex-1">
                    <h4
                      className={`truncate text-sm font-semibold ${
                        isActive ? "text-indigo-100" : "text-slate-200"
                      }`}
                    >
                      {contact.fullName}
                    </h4>
                    <p className="truncate text-xs text-slate-500">{contact.email}</p>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1.5">
                  {isMuted && <VolumeXIcon className="size-4 text-slate-600" />}

                  {requestStatus === "contact" ? (
                    <button
                      type="button"
                      onClick={() => setSelectedUser(contact)}
                      className="rounded-lg border border-emerald-400/25 bg-emerald-500/12 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                    >
                      Open
                    </button>
                  ) : requestStatus === "sent" ? (
                    <span className="cursor-default rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                      Pending
                    </span>
                  ) : requestStatus === "received" ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => acceptContactRequest(contact._id)}
                        title="Accept request"
                        className="grid size-8 place-items-center rounded-lg bg-emerald-500 text-white transition-all hover:bg-emerald-400 active:scale-90"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectContactRequest(contact._id)}
                        title="Reject request"
                        className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-slate-300 transition-all hover:bg-white/[0.1] active:scale-90"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sendContactRequest(contact._id)}
                      title="Send chat request"
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-[0_4px_14px_-6px_rgba(99,102,241,1)] transition-all hover:bg-indigo-400 active:scale-95"
                    >
                      <UserPlus className="size-3.5" />
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
export default ContactList;
