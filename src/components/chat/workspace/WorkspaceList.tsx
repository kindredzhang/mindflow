import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';
import { chatApi } from "@/services/api/chat";
import { fileApi, FileTree } from "@/services/api/file";
import { ChevronDown, ChevronRight, File, Folder, FolderCog, FolderOpen, MessageSquare, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface WorkspaceListProps {
  workspaces: Workspace[];
  selectedSessionId: string | null;
  onSelectSession: (session: Session) => void;
  onDeleteSession: (workspaceId: string, session: Session) => void;
  onCreateSession: (workspaceId: string) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  fetchWorkspaces?: () => Promise<void>;
  loading?: boolean;
}

export default function WorkspaceList({ 
  workspaces = [],
  selectedSessionId, 
  onSelectSession, 
  onDeleteSession,
  onCreateSession,
  onDeleteWorkspace,
  fetchWorkspaces,
  loading
}: WorkspaceListProps) {
  const debouncedCreateSession = useDebounce(
    (workspaceId: string) => onCreateSession(workspaceId),
    { wait: 1000 }
  );

  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(() => {
    return workspaces.length === 1 ? workspaces[0]?.workspace_id : null;
  });

  useEffect(() => {
    if (workspaces.length === 1) {
      setExpandedWorkspaceId(workspaces[0]?.workspace_id);
    } else if (workspaces.length === 0) {
      setExpandedWorkspaceId(null);
    }
  }, [workspaces]);

  const [fileTree, setFileTree] = useState<FileTree[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingFiles, setProcessingFiles] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [workspaceToRename, setWorkspaceToRename] = useState<{id: string, title: string} | null>(null);
  const [isSessionRenameDialogOpen, setIsSessionRenameDialogOpen] = useState(false);
  const [sessionToRename, setSessionToRename] = useState<{id: string, title: string, workspaceId: string} | null>(null);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const fetchFileTree = async (workspaceId: string) => {
    setIsLoadingFiles(true);
    try {
      const response = await fileApi.folderFileList(workspaceId);
      setFileTree(response);
      const selectedFileIds = response
        .flatMap(folder => folder.files)
        .filter(file => file.is_selected)
        .map(file => file.file_id);
      setSelectedFiles(selectedFileIds);
      
      if (response.length > 0) {
        // 默认展开第一个文件夹
        // setExpandedFolders(new Set([response[0].folder_id]));
        // 默认展开第一个有文件的文件夹
        const firstFolderWithFiles = response.find(folder => folder.files.length > 0);
        if (firstFolderWithFiles) {
          setExpandedFolders(new Set([firstFolderWithFiles.folder_id]));
        }
      }
    } catch (error) {
      console.error('Failed to fetch file tree:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // 在打开文件管理对话框时获取文件列表
  const handleOpenFileManager = async (workspaceId: string) => {
    await fetchFileTree(workspaceId);
  };

  const handleRemoveFileFromWorkspace = async (workspaceId: string, fileId: string) => {
    try {
      await fileApi.removeFileFromWorkspace(workspaceId, fileId);
      await fetchFileTree(workspaceId);
    } catch (error) {
      console.error('Failed to remove file from workspace:', error);
    }
  };

  const handleEditWorkspace = async (workspaceId: string, newTitle: string) => {
    try {
      await chatApi.renameWorkspace(workspaceId, newTitle);
      await fetchWorkspaces?.();
      setEditingWorkspaceId(null);
    } catch (error) {
      console.error('Failed to rename workspace:', error);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceToRename || !newWorkspaceTitle.trim()) return;

    try {
      await chatApi.renameWorkspace(workspaceToRename.id, newWorkspaceTitle);
      await fetchWorkspaces?.();
      setIsRenameDialogOpen(false);
      setWorkspaceToRename(null);
      setNewWorkspaceTitle("");
    } catch (error) {
      console.error('Failed to rename workspace:', error);
    }
  };

  const handleSessionRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToRename || !newSessionTitle.trim()) return;

    try {
      await chatApi.renameSession(sessionToRename.id, newSessionTitle);
      // 关闭弹窗
      setIsSessionRenameDialogOpen(false);
      setSessionToRename(null);
      setNewSessionTitle("");
      // 刷新工作区列表数据
      await fetchWorkspaces?.();
    } catch (error) {
      console.error('Failed to rename session:', error);
    }
  };

  if (!workspaces || !Array.isArray(workspaces)) return null;

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaceId(current => 
      current === workspaceId ? null : workspaceId
    );
  };

  const filteredFileTree = fileTree.map(folder => ({
    ...folder,
    // 只在搜索时过滤文件
    files: searchQuery 
      ? folder.files.filter(file =>
          !file.is_selected && file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : folder.files.filter(file => !file.is_selected)
  }));

  const handleConfirmFileSelection = async (workspaceId: string) => {
    if (selectedFiles.length === 0) return;
    setProcessingFiles(true);
    
    try {
      await fileApi.fileToEmbed(selectedFiles, workspaceId);
      const response = await fileApi.folderFileList(workspaceId);
      setFileTree(response);
      setSelectedFiles([]);
    } finally {
      setProcessingFiles(false);
    }
  };

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  };

  const toggleAllFolders = () => {
    if (expandedFolders.size === fileTree.length) {
      // 如果全部展开了，就全部折叠
      setExpandedFolders(new Set());
    } else {
      // 否则全部展开
      setExpandedFolders(new Set(fileTree.map(folder => folder.folder_id)));
    }
  };

  return (
    <div className="space-y-2">
      {loading ? (
        <div className="h-[200px]">
          <LoadingSpinner text="加载工作区..." />
        </div>
      ) : (
        <>
          <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>重命名工作区</DialogTitle>
                <DialogDescription>
                  请输入新的工作区名称，修改后将立即生效。
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRename} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="new-name" className="text-sm font-medium">
                    新名称
                  </label>
                  <Input
                    id="new-name"
                    value={newWorkspaceTitle}
                    onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                    placeholder="请输入新的工作区名称"
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRenameDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    确认
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isSessionRenameDialogOpen} onOpenChange={setIsSessionRenameDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>重命名会话</DialogTitle>
                <DialogDescription>
                  请输入新的会话名称。
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSessionRename} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="session-name" className="text-sm font-medium">
                    新名称
                  </label>
                  <Input
                    id="session-name"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    placeholder="请输入新的会话名称"
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSessionRenameDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    确认
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {workspaces
            .filter((workspace): workspace is Workspace => 
              workspace !== null && 
              workspace !== undefined && 
              typeof workspace.workspace_id === 'string'
            )
            .map((workspace) => (
              <Collapsible
                key={workspace.workspace_id}
                open={expandedWorkspaceId === workspace.workspace_id}
                onOpenChange={() => toggleWorkspace(workspace.workspace_id)}
              >
                <div className="flex items-center justify-between group rounded-lg hover:bg-muted">
                  <CollapsibleTrigger asChild>
                    <div className="flex-1 p-2 flex items-center space-x-2 cursor-pointer min-w-0">
                      {expandedWorkspaceId === workspace.workspace_id ? (
                        <FolderOpen size={16} className="text-primary flex-shrink-0" />
                      ) : (
                        <Folder size={16} className="text-primary flex-shrink-0" />
                      )}
                      {editingWorkspaceId === workspace.workspace_id ? (
                        <form 
                          className="flex-1 min-w-0"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleEditWorkspace(workspace.workspace_id, newWorkspaceTitle);
                          }}
                        >
                          <input
                            type="text"
                            value={newWorkspaceTitle}
                            onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none text-sm"
                            autoFocus
                            onBlur={() => setEditingWorkspaceId(null)}
                          />
                        </form>
                      ) : (
                        <span className="text-sm font-medium truncate flex-1">
                          {workspace.workspace_title}
                        </span>
                      )}
                    </div>
                  </CollapsibleTrigger>
                  
                  <div className="flex items-center gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFileManager(workspace.workspace_id);
                          }}
                          className="p-1 hover:bg-background rounded-md"
                        >
                          <FolderCog size={14} className="text-muted-foreground hover:text-foreground" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl h-[85vh] flex flex-col overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>文件管理</DialogTitle>
                          <DialogDescription>
                            选择要关联到工作区的文件
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div className="shrink-0 mb-4">
                            <Input
                              placeholder="搜索文件..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="flex-1 min-h-0 flex gap-4 mb-4">
                            {/* 左侧：可选择的文件列表 */}
                            <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
                              <div className="shrink-0 p-3 border-b bg-muted/50 flex justify-between items-center">
                                <h3 className="font-medium">可选文件</h3>
                                <button
                                  onClick={toggleAllFolders}
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  {expandedFolders.size === fileTree.length ? '全部折叠' : '全部展开'}
                                </button>
                              </div>
                              <div className="flex-1 overflow-y-auto p-2">
                                {isLoadingFiles ? (
                                  <LoadingSpinner text="加载文件列表..." />
                                ) : (
                                  filteredFileTree.map(folder => (
                                    <div key={folder.folder_id} className="mb-2">
                                      <button
                                        className={`w-full flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors
                                          ${expandedFolders.has(folder.folder_id) ? 'bg-muted/50' : ''}`}
                                        onClick={(e) => toggleFolder(folder.folder_id, e)}
                                      >
                                        {expandedFolders.has(folder.folder_id) ? (
                                          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                                        ) : (
                                          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                                        )}
                                        <Folder 
                                          size={16} 
                                          className={`shrink-0 ${
                                            expandedFolders.has(folder.folder_id) 
                                              ? 'text-primary' 
                                              : 'text-muted-foreground'
                                          }`} 
                                        />
                                        <span className={`text-sm font-medium truncate ${
                                          expandedFolders.has(folder.folder_id) 
                                            ? 'text-primary' 
                                            : 'text-foreground'
                                        }`}>
                                          {folder.folder_name}
                                        </span>
                                      </button>
                                      {expandedFolders.has(folder.folder_id) && (
                                        <div className="ml-9 space-y-1 mt-1 pl-4 border-l border-border">
                                          {folder.files.map(file => (
                                            <div
                                              key={file.file_id}
                                              className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md group"
                                            >
                                              <Checkbox
                                                checked={selectedFiles.includes(file.file_id)}
                                                onCheckedChange={(checked) => {
                                                  setSelectedFiles(prev =>
                                                    checked
                                                      ? [...prev, file.file_id]
                                                      : prev.filter(id => id !== file.file_id)
                                                  );
                                                }}
                                                className="shrink-0"
                                              />
                                              <File size={16} className="shrink-0 text-muted-foreground" />
                                              <span className="text-sm truncate flex-1">{file.file_name}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                            
                            {/* 右侧：已选择的文件列表 */}
                            <div className="w-72 border rounded-lg overflow-hidden flex flex-col">
                              <div className="shrink-0 p-3 border-b bg-muted/50">
                                <h3 className="font-medium">已关联文件</h3>
                              </div>
                              <div className="flex-1 overflow-y-auto">
                                {isLoadingFiles ? (
                                  <LoadingSpinner text="加载已关联文件..." />
                                ) : (
                                  <div className="space-y-2 p-4">
                                    {fileTree
                                      .flatMap(folder => folder.files)
                                      .filter(file => file.is_selected)
                                      .map((file, index) => (
                                        <div 
                                          key={`${file.file_id}-${index}`}
                                          className="flex items-center space-x-2 p-2 bg-muted rounded-md"
                                        >
                                          <File size={16} className="text-muted-foreground" />
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">{file.file_name}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {new Date(file.file_upload_time).toLocaleString()}
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => handleRemoveFileFromWorkspace(workspace.workspace_id, file.file_id)}
                                            className="p-1 hover:bg-background rounded-md"
                                          >
                                            <X size={14} className="text-destructive" />
                                          </button>
                                        </div>
                                      ))
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex justify-end space-x-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setSelectedFiles([])}>
                              重置
                            </Button>
                            <Button 
                              onClick={() => handleConfirmFileSelection(workspace.workspace_id)}
                              disabled={selectedFiles.length === 0 || processingFiles}
                            >
                              {processingFiles ? '处理中...' : '确认选择'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setWorkspaceToRename({
                          id: workspace.workspace_id,
                          title: workspace.workspace_title
                        });
                        setNewWorkspaceTitle(workspace.workspace_title);
                        setIsRenameDialogOpen(true);
                      }}
                      className="p-1 hover:bg-background rounded-md"
                    >
                      <Pencil size={14} className="text-muted-foreground hover:text-foreground" />
                    </button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:bg-background rounded-md"
                        >
                          <Trash2 size={14} className="text-destructive hover:text-destructive/90" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除工作区？</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>此操作将永久删除该工作区，包括：</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>工作区下的所有会话记录</li>
                              <li>相关的知识库向量文件</li>
                              <li>有关联的上下文信息</li>
                            </ul>
                            <p className="font-medium text-destructive">此操作不可撤销，请谨慎操作！</p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteWorkspace(workspace.workspace_id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <CollapsibleContent className="relative pl-6">
                  <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border" />
                  
                  <div className="space-y-0.5">
                    {workspace.sessions.map(session => (
                      <div
                        key={session.session_id}
                        data-session-id={session.session_id}
                        className={`relative w-full p-1.5 rounded-md transition-colors ${
                          selectedSessionId === session.session_id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-foreground hover:bg-background/80'
                        }`}
                        onClick={() => onSelectSession(session)}
                      >
                        <div className="absolute left-[-1.25rem] top-1/2 w-3 h-px bg-border" />
                        
                        <div className="flex items-center space-x-2">
                          <MessageSquare size={14} className="flex-shrink-0" />
                          <div 
                            className="flex-1 min-w-0 flex items-center justify-between cursor-pointer"
                            onClick={() => onSelectSession(session)}
                          >
                            <p className="text-sm truncate">
                              {session.session_title}
                            </p>
                            <div className="flex items-center space-x-1">
                              <button
                                className="p-1 hover:bg-background/80 rounded-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSessionToRename({
                                    id: session.session_id,
                                    title: session.session_title,
                                    workspaceId: workspace.workspace_id
                                  });
                                  setNewSessionTitle(session.session_title);
                                  setIsSessionRenameDialogOpen(true);
                                }}
                              >
                                <Pencil size={12} className="text-muted-foreground hover:text-foreground" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button 
                                    className="p-1 hover:bg-destructive/10 rounded-sm ml-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 size={12} className="text-destructive" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除会话</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除这个会话吗？此操作无法撤销。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSession(workspace.workspace_id, session);
                                      }}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="relative">
                      <div className="absolute left-[-1.25rem] top-1/2 w-3 h-px bg-border" />
                      <button
                        onClick={() => debouncedCreateSession(workspace.workspace_id)}
                        className="w-full flex items-center space-x-1.5 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
                      >
                        <Plus size={14} className="flex-shrink-0" />
                        <span>New Thread</span>
                      </button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </>
      )}
    </div>
  );
}