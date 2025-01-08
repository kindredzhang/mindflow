import { apiService } from "@/services/api/axios";
import { Message } from "@/types";
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
}

export const chatApi = {
  // 获取工作区列表
  getWorkspaceSessions: async () => {
    return apiService.get<Workspace[]>('/workspace/list', {
      errorMessage: '获取工作区列表失败'
    });
  },

  // 获取会话消息
  getChatHistory: async (sessionId: string) => {
    return apiService.get<Message[]>(`/chat/history/${sessionId}`, {
      errorMessage: '获取聊天记录失败'
    });
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
    return apiService.post('/chat/remove', { message_id: messageId }, {
      successMessage: '消息已删除',
      errorMessage: '删除消息失败'
    });
  },

  // 创建新工作区
  createWorkspace: async (title: string) => {
    return apiService.post('/workspace/save', { title }, {
      successMessage: '工作区创建成功',
      errorMessage: '创建工作区失败'
    });
  },

  // 删除工作区
  deleteWorkspace: async (workspaceId: string) => {
    return apiService.post('/workspace/delete', { workspace_id: workspaceId }, {
      successMessage: '工作区删除成功',
      errorMessage: '删除工作区失败'
    });
  },

  // 重命名工作区
  renameWorkspace: async (workspaceId: string, title: string) => {
    return apiService.post('/workspace/rename', { workspace_id: workspaceId, title }, {
      successMessage: '工作区名称已更新',
      errorMessage: '更新工作区名称失败'
    });
  },

  // 创建新会话 return session id of new session
  createSession: async (workspaceId: string) => {
    return apiService.post<string>('/session/save', { 
      workspaceId, 
      title: "New Thread" 
    }, {
      successMessage: '会话创建成功',
      errorMessage: '创建会话失败'
    });
  },

  // 删除会话
  deleteSession: async (sessionId: string) => {
    return apiService.post<void>('/session/delete', { session_id: sessionId }, {
      successMessage: '会话已删除',
      errorMessage: '删除会话失败'
    });
  },

  // 删除聊天消息
  deleteChatMessage: async (messageId: string) => {
    return apiService.post('/history/delete', { message_id: messageId }, {
      successMessage: '消息已删除',
      errorMessage: '删除消息失败'
    });
  },

  // 重命名会话
  renameSession: async (sessionId: string, title: string) => {
    return apiService.post('/session/rename', { session_id: sessionId, title }, {
      silent: true // 不显示提示
    });
  },
}
