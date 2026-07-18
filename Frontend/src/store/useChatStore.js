import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  typingUsers: {}, // { [userId]: boolean }
  replyingTo: null, // message object

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    // Clear typing indicator and replies when changing conversations
    set({ selectedUser, replyingTo: null });
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
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      get().markMessageAsRead(newMessage._id);

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

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
    socket.off("newMessage");
    socket.off("typing_start");
    socket.off("typing_end");
    socket.off("message_status_update");
    socket.off("message_edited");
    socket.off("message_deleted");
    socket.off("message_reacted");
  },
}));