import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkspaceHeaderProps {
  onCreateWorkspace: (workspaceName: string) => void;
}

export function WorkspaceHeader({ onCreateWorkspace }: WorkspaceHeaderProps) {
  const navigate = useNavigate();
  const [isNewWorkspaceDialogOpen, setIsNewWorkspaceDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    onCreateWorkspace(newWorkspaceName);
    setNewWorkspaceName('');
    setIsNewWorkspaceDialogOpen(false);
  };

  return (
    <div className="p-4 space-y-3">
      <Dialog open={isNewWorkspaceDialogOpen} onOpenChange={setIsNewWorkspaceDialogOpen}>
        <DialogTrigger asChild>
          <button
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
            <DialogDescription>
              创建一个新的工作区来组织你的对话
            </DialogDescription>
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
  );
} 