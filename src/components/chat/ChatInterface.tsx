import { ChatInput } from '@/components/chat/input/ChatInput';
import { ChatMessage } from '@/components/chat/message/ChatMessage';
import { RecentFiles } from '@/components/chat/workspace/RecentFiles';
import WorkspaceList from '@/components/chat/workspace/WorkspaceList';
import { ResizablePanel } from '@/components/common/ResizablePanel';
import Navigation from '@/components/layout/Navigation';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { chatApi } from '@/services/api/chat';
import { fileApi, FileUploadHistory } from '@/services/api/file';
import type { Message } from '@/types';
import { MessageSquare, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { WelcomeScreen } from './WelcomeScreen';
import WelcomeChatScreen from './welcome/WelcomeChatScreeen';

interface SendMessageRequest {
  question: string;
  chat_history?: Message[];
  file?: File;
  session_id?: string;
  quoted_message_id?: string;
}

interface Session {
  session_id: string;
  session_title: string;
  session_created_at: string;
}

interface Workspace {
  workspace_id: string;
  workspace_title: string;
  workspace_created_at: string;
  sessions: Session[];
}

export default function ChatInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isNewWorkspaceDialogOpen, setIsNewWorkspaceDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [recentFiles, setRecentFiles] = useState<FileUploadHistory[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState<{
    messageId: string;
    content: string;
  } | null>(null);
  const [loadingRecentFiles, setLoadingRecentFiles] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      const response = await chatApi.getWorkspaceSessions();
      setWorkspaces(response as Workspace[]);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const fetchRecentFiles = async () => {
      setLoadingRecentFiles(true);
      try {
        const response = await fileApi.fileUploadHistory();
        setRecentFiles(Array.isArray(response) ? response : [response]);
      } catch (error) {
        console.error('Failed to fetch recent files:', error);
      } finally {
        setLoadingRecentFiles(false);
      }
    };

    fetchRecentFiles();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      setIsFirstMessage(messages.length === 0);
    }
  }, [selectedSessionId, messages.length]);

  useEffect(() => {
    if (location.state?.clearSession) {
      setSelectedSessionId(null);
      navigate('/chat', { 
        replace: true,
        state: {} 
      });
    }
  }, [location.state, navigate]);

  const handleNewChat = () => {
    setIsNewWorkspaceDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleQuote = (messageId: string, content: string) => {
    setQuotedMessage({ messageId, content });
    const inputElement = document.querySelector<HTMLTextAreaElement>('.chat-input');
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const question = input.trim();
    setInput('');
    setIsSending(true);
    
    try {
      const messageData: SendMessageRequest = {
        question,
        session_id: selectedSessionId || '0',
        quoted_message_id: quotedMessage?.messageId,
      };

      if (selectedFile) {
        messageData.file = selectedFile;
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        content: question,
        role: 'user',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: '',
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);

      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      
      const reader = await chatApi.sendMessage(messageData);
      let fullResponse = '';
      let currentSessionName = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const lines = new TextDecoder().decode(value).split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const data = JSON.parse(line);
              
              switch (data.type) {
                case 'error':
                  toast.error(data.message || data.data?.message);
                  break;

                case 'metadata':
                  if (data.data?.file_metadata) {
                    setMessages(prev => prev.map((msg, index) => {
                      if (index === prev.length - 1) {
                        return {
                          ...msg,
                          relatedFiles: data.data.file_metadata
                        };
                      }
                      return msg;
                    }));
                  }
                  break;
                  
                case 'chunk':
                  if (data.data?.content) {
                    fullResponse += data.data.content;
                    setMessages(prev => prev.map((msg, index) => {
                      if (index === prev.length - 1) {
                        return { ...msg, content: fullResponse };
                      }
                      return msg;
                    }));

                    if (isFirstMessage && selectedSessionId) {
                      const newName = input.slice(0, 15) + (input.length > 15 ? '...' : '');
                      if (newName !== currentSessionName) {
                        currentSessionName = newName;
                        await chatApi.renameSession(selectedSessionId, newName);
                        await fetchWorkspaces();
                      }
                    }
                  }
                  break;

                case 'complete':
                  console.log('Chat saved:', data.data?.message);
                  break;
                  
                default:
                  console.warn('Unknown message type:', data.type);
              }
            } catch (parseError) {
              console.error('Failed to parse server message:', line, parseError);
            }
          }
        }
      }
      
      setIsFirstMessage(false);
      setSelectedFile(null);
      setQuotedMessage(null);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error instanceof Error ? error.message : "未知错误");
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectSession = async (session: Session) => {
    setSelectedSessionId(session.session_id);
    setLoadingMessages(true);
    
    try {
      const history = await chatApi.getChatHistory(session.session_id);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteSession = async (workspaceId: string, session: Session) => {
    try {
      await chatApi.deleteSession(session.session_id);
      
      setWorkspaces(workspaces.map(workspace => {
        if (workspace.workspace_id === workspaceId) {
          return {
            ...workspace,
            sessions: workspace.sessions.filter(s => s.session_id !== session.session_id)
          };
        }
        return workspace;
      }));
      
      if (selectedSessionId === session.session_id) {
        setSelectedSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      await chatApi.deleteWorkspace(workspaceId);
      
      if (workspaces.find(w => w.workspace_id === workspaceId)?.sessions.some(s => s.session_id === selectedSessionId)) {
        setSelectedSessionId(null);
        setMessages([]);
      }
      
      await fetchWorkspaces();
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      toast.error('删除工作区失败');
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    await chatApi.createWorkspace(newWorkspaceName);
    await fetchWorkspaces();
    setNewWorkspaceName('');
    setIsNewWorkspaceDialogOpen(false);
  };

  const handleCreateSession = async (workspaceId: string) => {
    try {
      const newSessionId = await chatApi.createSession(workspaceId);
      
      await fetchWorkspaces();

      setSelectedSessionId(newSessionId);
      
      setMessages([]);
      
      setLoadingMessages(true);
      try {
        const history = await chatApi.getChatHistory(newSessionId);
        setMessages(history);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        toast.error('加载聊天记录失败');
      } finally {
        setLoadingMessages(false);
      }
      
      setTimeout(() => {
        const newSessionElement = document.querySelector(`[data-session-id="${newSessionId}"]`);
        newSessionElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('创建会话失败');
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('已复制到剪贴板');
    });
  };

  const handleSpeakContent = (content: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      toast.success('已停止朗读');
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
      toast.success('正在朗读内容');
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    chatApi.deleteChatMessage(messageId);
    toast.success('消息已删除');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#1a1a1a]">
      <Navigation />
      
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Sidebar */}
        <ResizablePanel className="bg-card border-r border-[#2a2a2a]">
          <div className="h-full flex flex-col">
            <div className="p-4 space-y-3">
              <Dialog open={isNewWorkspaceDialogOpen} onOpenChange={setIsNewWorkspaceDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={handleNewChat}
                    className="w-full flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md"
                  >
                    <MessageSquare size={16} />
                    <span>新建工作区</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新建工作区</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateWorkspace} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="workspace-name" className="text-sm font-medium">
                        工作区名称
                      </label>
                      <Input
                        id="workspace-name"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="请输入工作区名称"
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsNewWorkspaceDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-600/90">
                        创建
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <button
                onClick={() => navigate('/knowledge')} 
                className="w-full flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md"
              >
                <Upload size={16} />
                <span>上传文档</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
              <div className="mb-4">
                <WorkspaceList
                  workspaces={workspaces}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                  onCreateSession={handleCreateSession}
                  loading={loading}
                  onDeleteWorkspace={handleDeleteWorkspace}
                  fetchWorkspaces={fetchWorkspaces}
                />
              </div>
            </div>

            <RecentFiles 
              files={recentFiles} 
              loading={loadingRecentFiles}
            />
          </div>
        </ResizablePanel>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar chat-container bg-[#141414]">
            <div className="max-w-3xl mx-auto space-y-8">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <LoadingSpinner text="加载聊天记录中..." />
                </div>
              ) : selectedSessionId ? (
                messages.length === 0 ? (
                  <WelcomeChatScreen />
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onCopy={handleCopyContent}
                      onSpeak={handleSpeakContent}
                      onDelete={handleDeleteMessage}
                      onQuote={handleQuote}
                    />
                  ))
                )
              ) : (
                <WelcomeScreen />
              )}
            </div>
          </div>

          {selectedSessionId && (
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              isSending={isSending}
              quotedMessage={quotedMessage}
              onCancelQuote={() => setQuotedMessage(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}