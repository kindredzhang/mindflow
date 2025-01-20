import { apiService } from "@/services/api/axios";
import { showToast } from '@/store/toast';
import { Message, QuotedMessage } from "@/types";
import { handleRequest } from '@/utils/request';

export interface Session {
  session_id: string;
  session_title: string;
  session_created_at: string;
}

export interface Workspace {
  workspace_id: string;
  workspace_title: string;
  sessions: Session[];
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  knowledgeBase: 'department' | 'enterprise';
}

export interface SendMessageRequest {
  question: string;
  session_id?: string;
  file?: File;
  quoted_message?: QuotedMessage;
}

interface CreateSessionResponse {
  session_id: string;
}

export const chatApi = {
  // 获取工作区列表
  getWorkspaceSessions: async () => {
    try {
      const response = await apiService.get<Workspace[]>('/workspace/list');
      return response;
    } catch (error) {
      showToast({
        title: "获取失败",
        description: error instanceof Error ? error.message : '获取工作区列表失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 获取会话消息
  getChatHistory: async (sessionId: string) => {
    try {
      const response = await apiService.get<Message[]>(`/chat/history/list?session_id=${sessionId}`);
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('无效的session id')) {
        showToast({
          title: "获取失败",
          description: "无效的session id",
          variant: "destructive",
        });
      } else {
        showToast({
          title: "获取失败", 
          description: error instanceof Error ? error.message : '获取聊天记录失败',
          variant: "destructive",
        });
      }
      throw error;
    }
  },

  // 发送消息
  sendMessage: async (data: SendMessageRequest): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    return handleRequest(
      async () => {
        const formData = new FormData();
        formData.append('question', data.question);
        formData.append('session_id', data.session_id || '0');
        if (data.file) {
          formData.append('file', data.file);
        }
        if (data.quoted_message) {
          formData.append('quoted_message', JSON.stringify(data.quoted_message));
        }

        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        return reader;
      },
      {
        showSuccessToast: false,
        errorMessage: '发送消息失败'
      }
    );
  },

  removeMessage: async (messageId: string) => {
    try {
      const response = await apiService.post('/chat/remove', { message_id: messageId });
      showToast({
        title: "删除成功",
        description: "消息已删除",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "删除失败",
        description: error instanceof Error ? error.message : '删除消息失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 创建新工作区
  createWorkspace: async (title: string) => {
    try {
      const response = await apiService.post('/workspace/save', { title });
      showToast({
        title: "创建成功",
        description: "工作区创建成功",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "创建失败",
        description: error instanceof Error ? error.message : '创建工作区失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 删除工作区
  deleteWorkspace: async (workspaceId: string) => {
    try {
      const response = await apiService.post('/workspace/delete', { workspace_id: workspaceId });
      showToast({
        title: "删除成功",
        description: "工作区删除成功",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "删除失败",
        description: error instanceof Error ? error.message : '删除工作区失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 重命名工作区
  renameWorkspace: async (workspaceId: string, title: string) => {
    try {
      const response = await apiService.post('/workspace/rename', { workspace_id: workspaceId, title });
      showToast({
        title: "重命名成功",
        description: "工作区名称已更新",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "重命名失败",
        description: error instanceof Error ? error.message : '更新工作区名称失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 创建新会话 return session id of new session
  createSession: async (workspaceId: string) => {
    try {
      const response = await apiService.post<CreateSessionResponse>('/session/save', { 
        'workspace_id': workspaceId, 
        'title': "New Thread" 
      });
      showToast({
        title: "创建成功",
        description: "会话创建成功",
        variant: "default",
      });
      return response.session_id;
    } catch (error) {
      showToast({
        title: "创建失败",
        description: error instanceof Error ? error.message : '创建会话失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 删除会话
  deleteSession: async (sessionId: string) => {
    try {
      const response = await apiService.post<void>('/session/delete', { session_id: sessionId });
      showToast({
        title: "删除成功",
        description: "会话已删除",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "删除失败",
        description: error instanceof Error ? error.message : '删除会话失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 删除聊天消息
  deleteChatMessage: async (messageId: string) => {
    try {
      const response = await apiService.post('/history/delete', { message_id: messageId });
      showToast({
        title: "删除成功",
        description: "消息已删除",
        variant: "default",
      });
      return response;
    } catch (error) {
      showToast({
        title: "删除失败",
        description: error instanceof Error ? error.message : '删除消息失败',
        variant: "destructive",
      });
      throw error;
    }
  },

  // 重命名会话
  renameSession: async (sessionId: string, title: string) => {
    try {
      return await apiService.post('/session/rename', { session_id: sessionId, title });
    } catch (error) {
      showToast({
        title: "重命名失败",
        description: error instanceof Error ? error.message : '重命名会话失败',
        variant: "destructive",
      });
      throw error;
    }
  },
}
