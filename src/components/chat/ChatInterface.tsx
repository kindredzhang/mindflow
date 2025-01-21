import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { ChatInput } from '@/components/chat/input/ChatInput';
import { ChatMessage } from '@/components/chat/message/ChatMessage';
import WelcomeChatScreen from '@/components/chat/welcome/WelcomeChatScreeen';
import { RecentFiles } from '@/components/chat/workspace/RecentFiles';
import WorkspaceList from '@/components/chat/workspace/WorkspaceList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
import { useDebounce } from '@/hooks/use-debounce';
import { chatApi } from '@/services/api/chat';
import { fileApi, FileUploadHistory } from '@/services/api/file';
import type { Message } from '@/types';
import { MessageSquare, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

interface SendMessageRequest {
  question: string;
  chat_history?: Message[];
  file?: File;
  session_id?: string;
  quoted_message?: QuotedMessage;
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

interface QuotedMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
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
  const [quotedMessage, setQuotedMessage] = useState<QuotedMessage | null>(null);
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
    setSelectedFile(file || null);
  };

  const handleQuote = (messageId: string, content: string, role: 'user' | 'assistant') => {
    setQuotedMessage({ 
      id: messageId,
      content,
      role
    });
    const inputElement = document.querySelector<HTMLTextAreaElement>('.chat-input');
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const tempUserMessageId = `temp-user-${Date.now()}`;
    const tempAssistantMessageId = `temp-assistant-${Date.now()}`;

    const question = input.trim();
    setInput('');
    setIsSending(true);
    
    try {
      const messageData: SendMessageRequest = {
        question,
        session_id: selectedSessionId || '0',
        quoted_message: quotedMessage || undefined,
      };

      if (selectedFile) {
        messageData.file = selectedFile;
      }

      // 添加临时消息，用于在服务器响应中替换
      const tempUserMessage: Message = {
        id: tempUserMessageId,
        content: question,
        role: 'user',
        timestamp: Date.now(),
        quoted_message: quotedMessage || undefined,
      };
      
      const tempAiMessage: Message = {
        id: tempAssistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, tempUserMessage, tempAiMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      
      const reader = await chatApi.sendMessage(messageData);
      let fullResponse = '';
      let currentSessionName = '';
      let hasError = false;
      
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
                  hasError = true;
                  // Remove only the specific temporary messages
                  setMessages(prev => prev.filter(msg => 
                    msg.id !== tempAssistantMessageId && msg.id !== tempUserMessageId
                  ));
                  toast.error(data.message || data.data?.message || '对话发生错误');
                  break;

                case 'metadata':
                  if (!hasError && data.data?.file_metadata) {
                    console.log('file_metadata:', data.data.file_metadata); 
                    // Update only the specific temporary assistant message
                    setMessages(prev => prev.map(msg => {
                      if (msg.id === tempAssistantMessageId) {
                        return {
                          ...msg,
                          id: data.data.message_id || msg.id,
                          related_files: data.data.file_metadata
                        };
                      }
                      return msg;
                    }));
                  }
                  break;
                  
                case 'chunk':
                  if (!hasError && data.data?.content) {
                    fullResponse += data.data.content;
                    setMessages(prev => prev.map(msg => {
                      if (msg.id === tempAssistantMessageId) {
                        return { 
                          ...msg,
                          content: fullResponse,
                          id: data.data.message_id || msg.id
                        };
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
                  if (!hasError) {
                    // 实际消息存储之后得到真实数据库ID替换临时消息ID 
                    const { user_message_id, assistant_message_id } = data.data || {};
                    if (user_message_id && assistant_message_id) {

                      setMessages(prev => {
                        const updated = prev.map(msg => {
                          if (msg.id === tempUserMessageId) {
                            return { ...msg, id: user_message_id };
                          }
                          if (msg.id === tempAssistantMessageId) {
                            return { ...msg, id: assistant_message_id };
                          }
                          return msg;
                        });
                        
                        return updated;
                      });
                    } else {
                      console.warn('Missing message IDs in complete response:', data.data);
                    }
                  }
                  break;
                  
                default:
                  console.warn('Unknown message type:', data.type);
              }
            } catch (parseError) {
              console.error('Failed to parse server message:', line, parseError);
              hasError = true;
              // Remove only the specific temporary messages
              setMessages(prev => prev.filter(msg => 
                msg.id !== tempAssistantMessageId && msg.id !== tempUserMessageId
              ));
              toast.error('解析服务器响应时发生错误');
            }
          }
        }
      }
      
      if (!hasError) {
        setIsFirstMessage(false);
        setSelectedFile(null);
        setQuotedMessage(null);
      }
      
    } catch (error) {
      // Remove only the specific temporary messages
      setMessages(prev => prev.filter(msg => 
        msg.id !== tempAssistantMessageId && msg.id !== tempUserMessageId
      ));
      toast.error(error instanceof Error ? error.message : "发送消息失败");
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

  const debouncedCreateWorkspace = useDebounce(async (workspaceName: string) => {
    try {
      await chatApi.createWorkspace(workspaceName);
      await fetchWorkspaces();
      setNewWorkspaceName('');
      setIsNewWorkspaceDialogOpen(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast.error('创建工作区失败');
    }
  }, 500);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    debouncedCreateWorkspace(newWorkspaceName);
  };

  const handleCreateSession = async (workspaceId: string) => {
    try {
      const session_id = await chatApi.createSession(workspaceId);
      
      await fetchWorkspaces();

      setSelectedSessionId(session_id);
      
      setMessages([]);
      
      setLoadingMessages(true);
      try {
        const history = await chatApi.getChatHistory(session_id);
        setMessages(history);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        toast.error('加载聊天记录失败');
      } finally {
        setLoadingMessages(false);
      }
      
      setTimeout(() => {
        const newSessionElement = document.querySelector(`[data-session-id="${session_id}"]`);
        newSessionElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('创建会话失败');
    }
  };

  const handleCopyContent = async (content: string) => {
    try {
      // 首先尝试使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // 后备方案：使用传统的复制方法
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      toast.success('已复制到剪贴板');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('复制失败');
    }
  };

  const handleSpeakContent = (content: string) => {
    console.log('Speaking content:', content);
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

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      
      // 添加高亮动画效果
      element.style.backgroundColor = 'var(--highlight-color)';
      element.style.transition = 'background-color 1s ease';
      
      // 1秒后移除高亮
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1000);
    }
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
                    aria-label="新建工作区"
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
                        autoComplete="off"
                        maxLength={20}
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
                      onQuote={(messageId, content, role) => handleQuote(messageId, content, role)}
                      onScrollToMessage={scrollToMessage}
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