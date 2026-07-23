import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const playSynthSound = (type, volume = 0.5) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "chime") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "bubble") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "retro") {
      osc.type = "square";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.setValueAtTime(0, now + 0.08);
      gain.gain.setValueAtTime(volume, now + 0.1);
      osc.frequency.setValueAtTime(800, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.error("Failed to play synth sound:", e);
  }
};

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") === null ? true : JSON.parse(localStorage.getItem("isSoundEnabled")),
  isKeystrokeSoundEnabled: localStorage.getItem("isKeystrokeSoundEnabled") === null ? true : JSON.parse(localStorage.getItem("isKeystrokeSoundEnabled")),
  notificationVolume: localStorage.getItem("notificationVolume") === null ? 0.5 : JSON.parse(localStorage.getItem("notificationVolume")),
  notificationSoundType: localStorage.getItem("notificationSoundType") || "default",
  isDesktopNotificationsEnabled: JSON.parse(localStorage.getItem("isDesktopNotificationsEnabled")) === true,
  mutedUsers: JSON.parse(localStorage.getItem("mutedUsers")) || [],
  unreadCounts: {},
  typingUsers: {}, // { [userId]: boolean }
  replyingTo: null, // message object

  toggleSound: () => {
    const nextVal = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(nextVal));
    set({ isSoundEnabled: nextVal });
  },

  setNotificationSetting: (key, value) => {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    set({ [key]: value });
  },

  toggleUserMute: (userId) => {
    const { mutedUsers } = get();
    const isMuted = mutedUsers.includes(userId);
    const updated = isMuted ? mutedUsers.filter((id) => id !== userId) : [...mutedUsers, userId];
    localStorage.setItem("mutedUsers", JSON.stringify(updated));
    set({ mutedUsers: updated });
    toast.success(isMuted ? "Conversation unmuted" : "Conversation muted");
  },

  playNotificationSound: () => {
    const { isSoundEnabled, notificationVolume, notificationSoundType } = get();
    if (!isSoundEnabled) return;

    if (notificationSoundType === "default") {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = notificationVolume;
      audio.currentTime = 0;
      audio.play().catch((err) => console.log("Failed to play default sound:", err));
    } else {
      playSynthSound(notificationSoundType, notificationVolume);
    }
  },

  handleIncomingMessage: (newMessage) => {
    const { selectedUser, mutedUsers, isDesktopNotificationsEnabled, playNotificationSound } = get();
    const currentUserId = useAuthStore.getState().authUser?._id;
    if (newMessage.senderId === currentUserId) return; // ignore own messages

    const isMessageFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;
    const isMuted = mutedUsers.includes(newMessage.senderId);

    if (!isMuted) {
      playNotificationSound();

      if (isDesktopNotificationsEnabled && document.visibilityState === "hidden") {
        const chats = get().chats;
        const contacts = get().allContacts;
        const sender = chats.find((c) => c._id === newMessage.senderId) ||
                       contacts.find((c) => c._id === newMessage.senderId);
        const senderName = sender ? sender.fullName : "New message";

        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification(`New message from ${senderName}`, {
            body: newMessage.text || "Sent an attachment",
            icon: sender?.profilePic || "/avatar.png",
          });
          notification.onclick = () => {
            window.focus();
            if (sender) {
              get().setSelectedUser(sender);
            }
          };
        }
      }
    }

    if (isMessageFromSelectedUser) {
      set((state) => ({ messages: [...state.messages, newMessage] }));
      get().markMessageAsRead(newMessage._id);
    } else {
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [newMessage.senderId]: (state.unreadCounts[newMessage.senderId] || 0) + 1,
        },
      }));
    }

    get().getMyChatPartners();
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    // Clear typing indicator, replies, and unread counts when changing conversations
    set((state) => ({
      selectedUser,
      replyingTo: null,
      unreadCounts: selectedUser
        ? { ...state.unreadCounts, [selectedUser._id]: 0 }
        : state.unreadCounts,
    }));
  },

  setReplyingTo: (message) => set({ replyingTo: message }),

  sendTypingStart: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.emit("typing_start", { to: receiverId });
  },

  sendTypingEnd: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.emit("typing_end", { to: receiverId });
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      
      // Mark all received messages as read
      res.data.forEach((msg) => {
        if (msg.senderId === userId && msg.status !== "read") {
          get().markMessageAsRead(msg._id);
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      media: messageData.media,
      replyTo: replyingTo,
      status: "sent",
      reactions: [],
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    
    set({ messages: [...messages, optimisticMessage], replyingTo: null });

    try {
      const payload = {
        text: messageData.text,
        image: messageData.image,
        media: messageData.media,
        replyTo: replyingTo ? replyingTo._id : undefined,
      };
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      set((state) => ({
        messages: state.messages.map((msg) => (msg._id === tempId ? res.data : msg)),
      }));
    } catch (error) {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  markMessageAsRead: async (messageId) => {
    try {
      const res = await axiosInstance.post(`/messages/${messageId}/read`);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
      }));
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  },

  editMessage: async (messageId, text) => {
    const { messages } = get();
    set({
      messages: messages.map((msg) =>
        msg._id === messageId ? { ...msg, text, isEdited: true } : msg
      ),
    });

    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, { text });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
      }));
    } catch (error) {
      set({ messages });
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  deleteMessage: async (messageId) => {
    const { messages } = get();
    set({
      messages: messages.map((msg) =>
        msg._id === messageId
          ? { ...msg, text: "[This message was deleted]", image: undefined, media: undefined, isDeleted: true }
          : msg
      ),
    });

    try {
      const res = await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
      }));
    } catch (error) {
      set({ messages });
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  reactToMessage: async (messageId, emoji) => {
    const { messages } = get();
    const { authUser } = useAuthStore.getState();

    const updatedMessages = messages.map((msg) => {
      if (msg._id === messageId) {
        const reactions = [...(msg.reactions || [])];
        const existingIndex = reactions.findIndex(
          (r) => r.userId === authUser._id && r.emoji === emoji
        );
        if (existingIndex > -1) {
          reactions.splice(existingIndex, 1);
        } else {
          reactions.push({ emoji, userId: authUser._id });
        }
        return { ...msg, reactions };
      }
      return msg;
    });

    set({ messages: updatedMessages });

    try {
      const res = await axiosInstance.post(`/messages/${messageId}/react`, { emoji });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
      }));
    } catch (error) {
      set({ messages });
      toast.error(error.response?.data?.message || "Failed to react to message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("typing_start", ({ from }) => {
      if (from === selectedUser._id) {
        set((state) => ({
          typingUsers: { ...state.typingUsers, [from]: true },
        }));
      }
    });

    socket.on("typing_end", ({ from }) => {
      if (from === selectedUser._id) {
        set((state) => ({
          typingUsers: { ...state.typingUsers, [from]: false },
        }));
      }
    });

    socket.on("message_status_update", ({ messageId, status, readAt }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, status, readAt } : msg
        ),
      }));
    });

    socket.on("message_edited", ({ messageId, text, isEdited, editHistory }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, text, isEdited, editHistory } : msg
        ),
      }));
    });

    socket.on("message_deleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: "[This message was deleted]", image: undefined, media: undefined, isDeleted: true }
            : msg
        ),
      }));
    });

    socket.on("message_reacted", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("typing_start");
    socket.off("typing_end");
    socket.off("message_status_update");
    socket.off("message_edited");
    socket.off("message_deleted");
    socket.off("message_reacted");
  },
}));