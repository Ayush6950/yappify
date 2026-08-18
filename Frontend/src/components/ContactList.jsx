import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { Search, VolumeXIcon } from "lucide-react";

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

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      <div className="mb-3">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by email or name"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-400 outline-none ring-0 focus:border-indigo-500"
          />
        </label>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-center text-sm text-slate-400">
          {searchQuery ? "No user found for this email or name." : "Search for users to send a chat request."}
        </div>
      ) : (
        filteredContacts.map((contact) => {
          const isMuted = mutedUsers.includes(contact._id);
          const requestStatus = contact.requestStatus || "none";

          return (
            <div
              key={contact._id}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${
                selectedUser?._id === contact._id
                  ? "bg-indigo-500/10 border border-indigo-500/20 shadow-md shadow-indigo-500/5"
                  : "bg-transparent hover:bg-slate-900/30 border border-transparent"
              }`}
            >
              <div
                className="flex min-w-0 flex-1 items-center gap-3 cursor-pointer"
                onClick={() => setSelectedUser(contact)}
              >
                <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                  <div className="size-12 rounded-full">
                    <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className={`truncate text-sm font-semibold ${selectedUser?._id === contact._id ? "text-indigo-400" : "text-slate-300"}`}>
                    {contact.fullName}
                  </h4>
                  <p className="truncate text-xs text-slate-400">{contact.email}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {requestStatus === "contact" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedUser(contact)}
                    className="rounded-lg bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-300"
                  >
                    Open chat
                  </button>
                ) : requestStatus === "sent" ? (
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-lg bg-slate-700/60 px-2 py-1 text-[10px] font-medium text-slate-300"
                  >
                    Requested
                  </button>
                ) : requestStatus === "received" ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => acceptContactRequest(contact._id)}
                      className="rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-emerald-400"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectContactRequest(contact._id)}
                      className="rounded-lg bg-slate-700 px-2 py-1 text-[10px] font-medium text-slate-200 transition hover:bg-slate-600"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendContactRequest(contact._id)}
                    className="rounded-lg bg-indigo-500 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-indigo-400"
                  >
                    Send request
                  </button>
                )}

                {isMuted && (
                  <div className="flex-shrink-0">
                    <VolumeXIcon className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
export default ContactList;