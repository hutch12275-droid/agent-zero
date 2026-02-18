import { create } from "zustand";
import type {
  AgentMode,
  ChatMessage,
  Conversation,
  MemoryEntry,
  SILearningEntry,
} from "./agent/types";
import { DEFAULT_MODEL_ID } from "./agent/models";
import { generateId } from "./utils";

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;

  // Agent
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;
  currentModelId: string;
  setCurrentModelId: (id: string) => void;

  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  createConversation: () => string;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    content: string
  ) => void;
  deleteConversation: (id: string) => void;

  // Memory
  memories: MemoryEntry[];
  addMemory: (memory: Omit<MemoryEntry, "id" | "createdAt" | "accessCount" | "lastAccessed">) => void;
  queryMemories: (query: string) => MemoryEntry[];
  deleteMemory: (id: string) => void;

  // SI Learning
  learningEntries: SILearningEntry[];
  addLearningEntry: (entry: Omit<SILearningEntry, "id" | "timestamp">) => void;

  // Settings
  openRouterKey: string;
  hfToken: string;
  setOpenRouterKey: (key: string) => void;
  setHfToken: (token: string) => void;

  // Streaming
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;

  // Tool outputs
  lastToolOutput: string | null;
  setLastToolOutput: (output: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: false,
  rightPanelOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),

  agentMode: "chat",
  setAgentMode: (mode) => set({ agentMode: mode }),
  currentModelId: DEFAULT_MODEL_ID,
  setCurrentModelId: (id) => set({ currentModelId: id }),

  conversations: [],
  currentConversationId: null,

  createConversation: () => {
    const id = generateId();
    const convo: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      agentMode: get().agentMode,
      modelId: get().currentModelId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({
      conversations: [convo, ...s.conversations],
      currentConversationId: id,
    }));
    return id;
  },

  setCurrentConversation: (id) => set({ currentConversationId: id }),

  addMessage: (conversationId, message) =>
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const updated = {
          ...c,
          messages: [...c.messages, message],
          updatedAt: Date.now(),
        };
        // Auto-title from first user message
        if (
          c.title === "New Chat" &&
          message.role === "user" &&
          c.messages.length === 0
        ) {
          updated.title =
            message.content.slice(0, 50) +
            (message.content.length > 50 ? "..." : "");
        }
        return updated;
      }),
    })),

  updateMessage: (conversationId, messageId, content) =>
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, content } : m
          ),
          updatedAt: Date.now(),
        };
      }),
    })),

  deleteConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      currentConversationId:
        s.currentConversationId === id ? null : s.currentConversationId,
    })),

  memories: [],
  addMemory: (memory) =>
    set((s) => ({
      memories: [
        {
          ...memory,
          id: generateId(),
          createdAt: Date.now(),
          accessCount: 0,
          lastAccessed: Date.now(),
        },
        ...s.memories,
      ],
    })),

  queryMemories: (query) => {
    const q = query.toLowerCase();
    return get()
      .memories.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);
  },

  deleteMemory: (id) =>
    set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),

  learningEntries: [],
  addLearningEntry: (entry) =>
    set((s) => ({
      learningEntries: [
        { ...entry, id: generateId(), timestamp: Date.now() },
        ...s.learningEntries,
      ],
    })),

  openRouterKey: "",
  hfToken: "",
  setOpenRouterKey: (key) => set({ openRouterKey: key }),
  setHfToken: (token) => set({ hfToken: token }),

  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  lastToolOutput: null,
  setLastToolOutput: (output) => set({ lastToolOutput: output }),
}));
