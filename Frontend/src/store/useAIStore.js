import { create } from "zustand";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";

const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "/api";

export const useAIStore = create((set, get) => ({
  isPanelOpen: false,
  isLoading: false,
  streamingText: "",
  lastAction: null,
  error: null,
  abortController: null,
  contextPartnerId: null,
  messageCount: 0,

  openPanel: () => {
    const { selectedUser } = useChatStore.getState();
    if (!selectedUser) {
      toast.error("Select a conversation first");
      return;
    }
    set({ isPanelOpen: true, contextPartnerId: selectedUser._id });
  },

  closePanel: () => {
    get().cancelStream();
    set({ isPanelOpen: false });
  },

  togglePanel: () => {
    const { isPanelOpen } = get();
    if (isPanelOpen) {
      get().closePanel();
    } else {
      get().openPanel();
    }
  },

  resetForPartnerChange: (partnerId) => {
    get().cancelStream();
    set({
      streamingText: "",
      lastAction: null,
      error: null,
      messageCount: 0,
      contextPartnerId: partnerId,
    });
  },

  cancelStream: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({ abortController: null, isLoading: false });
  },

  runAction: async (action) => {
    if (action === "summarize") {
      return get().summarize();
    }
  },

  summarize: async () => {
    const { selectedUser } = useChatStore.getState();
    if (!selectedUser) {
      toast.error("Select a conversation first");
      return;
    }

    get().cancelStream();
    const abortController = new AbortController();

    set({
      isLoading: true,
      streamingText: "",
      lastAction: "summarize",
      error: null,
      abortController,
      contextPartnerId: selectedUser._id,
      messageCount: 0,
    });

    try {
      const response = await fetch(`${API_BASE}/ai/summarize/stream`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: selectedUser._id }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to summarize conversation");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const payload = JSON.parse(line.slice(6));

          if (payload.type === "meta") {
            set({ messageCount: payload.messageCount ?? 0 });
          } else if (payload.type === "chunk") {
            set((state) => ({
              streamingText: state.streamingText + payload.text,
            }));
          } else if (payload.type === "error") {
            throw new Error(payload.message);
          }
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        set({ error: error.message });
        toast.error(error.message);
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },
}));
