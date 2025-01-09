import { chatApi } from '@/services/api/chat';
import type { Session, Workspace } from '@/types/workspace';
import { create } from 'zustand';

interface WorkspaceState {
  workspaces: Workspace[];
  selectedSessionId: string | null;
  loading: boolean;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setSelectedSessionId: (sessionId: string | null) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (title: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  createSession: (workspaceId: string) => Promise<string>;
  deleteSession: (workspaceId: string, session: Session) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  selectedSessionId: null,
  loading: false,

  setWorkspaces: (workspaces) => set({ workspaces }),
  setSelectedSessionId: (sessionId) => set({ selectedSessionId: sessionId }),

  fetchWorkspaces: async () => {
    set({ loading: true });
    try {
      const response = await chatApi.getWorkspaceSessions();
      set({ workspaces: response as Workspace[] });
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      set({ loading: false });
    }
  },

  createWorkspace: async (title) => {
    try {
      await chatApi.createWorkspace(title);
      await get().fetchWorkspaces();
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  },

  deleteWorkspace: async (workspaceId) => {
    try {
      await chatApi.deleteWorkspace(workspaceId);
      // 如果删除的是当前选中的工作区，清空选中状态
      const currentWorkspace = get().workspaces.find(w => w.workspace_id === workspaceId);
      if (currentWorkspace?.sessions.some(s => s.session_id === get().selectedSessionId)) {
        set({ selectedSessionId: null });
      }
      await get().fetchWorkspaces();
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  },

  createSession: async (workspaceId) => {
    try {
      const sessionId = await chatApi.createSession(workspaceId);
      await get().fetchWorkspaces();
      set({ selectedSessionId: sessionId });
      return sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  deleteSession: async (workspaceId, session) => {
    try {
      await chatApi.deleteSession(session.session_id);
      if (session.session_id === get().selectedSessionId) {
        set({ selectedSessionId: null });
      }
      await get().fetchWorkspaces();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  },
})); 