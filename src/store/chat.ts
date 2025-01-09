import { chatApi } from '@/services/api/chat';
import type { Message } from '@/types/chat';
import { create } from 'zustand';

interface ChatState {
  messages: Message[];
  loadingMessages: boolean;
  isSending: boolean;
  quotedMessage: { messageId: string; content: string; } | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  fetchChatHistory: (sessionId: string) => Promise<void>;
  setQuotedMessage: (message: { messageId: string; content: string; } | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loadingMessages: false,
  isSending: false,
  quotedMessage: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set(state => ({ messages: [...state.messages, message] })),
  
  updateLastMessage: (content) => set(state => ({
    messages: state.messages.map((msg, index) => 
      index === state.messages.length - 1 ? { ...msg, content } : msg
    )
  })),

  deleteMessage: async (messageId) => {
    try {
      await chatApi.deleteChatMessage(messageId);
      set(state => ({
        messages: state.messages.filter(msg => msg.id !== messageId)
      }));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  },

  fetchChatHistory: async (sessionId) => {
    set({ loadingMessages: true });
    try {
      const history = await chatApi.getChatHistory(sessionId);
      set({ messages: history });
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      set({ loadingMessages: false });
    }
  },

  setQuotedMessage: (message) => set({ quotedMessage: message }),
})); 