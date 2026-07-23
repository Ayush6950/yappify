import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { VolumeXIcon } from "lucide-react";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, selectedUser, isUsersLoading, mutedUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => {
        const isMuted = mutedUsers.includes(contact._id);

        return (
          <div
            key={contact._id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedUser?._id === contact._id
                ? "bg-amber-500/10 border border-amber-500/20 shadow-md shadow-amber-500/5"
                : "bg-transparent hover:bg-slate-900/30 border border-transparent"
            }`}
            onClick={() => setSelectedUser(contact)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                </div>
              </div>
              <h4 className={`font-semibold truncate text-sm ${selectedUser?._id === contact._id ? "text-amber-400" : "text-slate-300"}`}>
                {contact.fullName}
              </h4>
            </div>

            {isMuted && (
              <div className="flex-shrink-0">
                <VolumeXIcon className="w-4 h-4 text-slate-500" />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
export default ContactList;