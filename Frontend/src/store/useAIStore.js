import { create } from "zustand";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";

const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "/api";

const parseSSEStream = async (response, onEvent, signal) => {
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
      onEvent(payload);
    }
  }
};

export const useAIStore = create((set, get) => ({
  isPanelOpen: false,
  isLoading: false,
  streamingText: "",
  lastAction: null,
  error: null,
  abortController: null,
  contextPartnerId: null,
  messageCount: 0,
  assistantMessages: [],

  // Day 3: suggest reply
  suggestions: [],

  // Day 4: message-scoped actions
  selectedMessage: null,
  targetLanguage: "en",
  originalText: "",

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

  setSelectedMessage: (message) => set({ selectedMessage: message }),

  setTargetLanguage: (lang) => set({ targetLanguage: lang }),

  openPanelWithMessage: (message, action) => {
    const { selectedUser } = useChatStore.getState();
    if (!selectedUser) {
      toast.error("Select a conversation first");
      return;
    }
    set({
      isPanelOpen: true,
      selectedMessage: message,
      contextPartnerId: selectedUser._id,
      streamingText: "",
      suggestions: [],
      error: null,
    });
    if (action) {
      get().runAction(action);
    }
  },

  resetForPartnerChange: (partnerId) => {
    get().cancelStream();
    set({
      streamingText: "",
      lastAction: null,
      error: null,
      messageCount: 0,
  assistantMessages: [],
      contextPartnerId: partnerId,
      suggestions: [],
      selectedMessage: null,
      originalText: "",
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
    const actions = {
      summarize: () => get().summarize(),
      "suggest-reply": () => get().suggestReply(),
      translate: () => get().translate(),
      "explain-code": () => get().explainCode(),
    };
    const handler = actions[action];
    if (handler) return handler();
  },

  useSuggestionAsReply: (suggestion) => {
    useChatStore.getState().setDraftMessage(suggestion);
    toast.success("Reply added to composer");
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
      suggestions: [],
      abortController,
      contextPartnerId: selectedUser._id,
      messageCount: 0,
  assistantMessages: [],
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

      await parseSSEStream(
        response,
        (payload) => {
          if (payload.type === "meta") {
            set({ messageCount: payload.messageCount ?? 0 });
          } else if (payload.type === "chunk") {
            set((state) => ({
              streamingText: state.streamingText + payload.text,
            }));
          } else if (payload.type === "error") {
            throw new Error(payload.message);
          }
        },
        abortController.signal
      );
    } catch (error) {
      if (error.name !== "AbortError") {
        set({ error: error.message });
        toast.error(error.message);
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },

  suggestReply: async () => {
    const { selectedUser } = useChatStore.getState();
    if (!selectedUser) {
      toast.error("Select a conversation first");
      return;
    }

    get().cancelStream();
    const abortController = new AbortController();

    set({
      isLoading: true,
      lastAction: "suggest-reply",
      error: null,
      suggestions: [],
      streamingText: "",
      abortController,
      contextPartnerId: selectedUser._id,
    });

    try {
      const response = await fetch(`${API_BASE}/ai/suggest-reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: selectedUser._id }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to generate reply suggestions");
      }

      const data = await response.json();
      set({
        suggestions: data.suggestions || [],
        messageCount: data.messageCount ?? 0,
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        set({ error: error.message });
        toast.error(error.message);
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },

  getTargetMessage: () => {
    const { selectedMessage } = get();
    if (selectedMessage) return selectedMessage;

    const { messages, selectedUser } = useChatStore.getState();
    if (!selectedUser) return null;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === selectedUser._id && !messages[i].isDeleted) {
        return messages[i];
      }
    }
    return null;
  },

  translate: async () => {
    const { selectedUser } = useChatStore.getState();
    const { targetLanguage } = get();
    if (!selectedUser) {
      toast.error("Select a conversation first");
      return;
    }

    const message = get().getTargetMessage();
    if (!message) {
      toast.error("No message to translate");
      return;
    }

    get().cancelStream();
    const abortController = new AbortController();

    set({
      isLoading: true,
      streamingText: "",
      lastAction: "translate",
      error: null,
      suggestions: [],
      selectedMessage: message,
      abortController,
      contextPartnerId: selectedUser._id,
    });

    try {
      const response = await fetch(`${API_BASE}/ai/translate/stream`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: selectedUser._id,
          messageId: message._id,
          targetLanguage,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to translate message");
      }

      await parseSSEStream(response, (payload) => {
        if (payload.type === "meta") {
          set({ originalText: payload.originalText || "" });
        } else if (payload.type === "chunk") {
          set((state) => ({
            streamingText: state.streamingText + payload.text,
          }));
        } else if (payload.type === "error") {
          throw new Error(payload.message);
        }
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        set({ error: error.message });
        toast.error(error.message);
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },

  explainCode: async () => {
    const { selectedUser } = useChatStore.getState();
    if (!selectedUser) {
      toast.error("Select a conversation first");
      return;
    }

    const message = get().getTargetMessage();
    if (!message) {
      toast.error("No message selected to explain");
      return;
    }

    get().cancelStream();
    const abortController = new AbortController();

    set({
      isLoading: true,
      streamingText: "",
      lastAction: "explain-code",
      error: null,
      suggestions: [],
      selectedMessage: message,
      abortController,
      contextPartnerId: selectedUser._id,
    });

    try {
      const response = await fetch(`${API_BASE}/ai/explain-code/stream`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: selectedUser._id,
          messageId: message._id,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to explain code");
      }

      await parseSSEStream(response, (payload) => {
        if (payload.type === "meta") {
          set({ originalText: payload.originalText || "" });
        } else if (payload.type === "chunk") {
          set((state) => ({
            streamingText: state.streamingText + payload.text,
          }));
        } else if (payload.type === "error") {
          throw new Error(payload.message);
        }
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        set({ error: error.message });
        toast.error(error.message);
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },
  clearAssistantMessages: () => set({ assistantMessages: [], error: null }),

  askAssistant: async (question) => {
    const cleanQuestion = question?.trim();
    if (!cleanQuestion) return;
    const history = get().assistantMessages;
    const userMessage = { role: "user", content: cleanQuestion };
    set({ isLoading: true, lastAction: "assistant-chat", error: null, assistantMessages: [...history, userMessage] });
    try {
      const response = await fetch(`${API_BASE}/ai/chat`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: cleanQuestion, history }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get an AI response");
      set((state) => ({ assistantMessages: [...state.assistantMessages, { role: "assistant", content: data.answer }] }));
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message);
    } finally { set({ isLoading: false }); }
  },
}));