import { MessageSquare, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkspaceHeaderProps {
  onNewWorkspace: () => void;
}

export function WorkspaceHeader({ onNewWorkspace }: WorkspaceHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3">
      <button
        onClick={onNewWorkspace}
        className="w-full flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md"
      >
        <MessageSquare size={16} />
        <span>新建工作区</span>
      </button>

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