import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { FileUploadHistory } from '@/services/api/file';
import { FileText } from 'lucide-react';

interface WorkspaceRelatedFilesProps {
  files: FileUploadHistory[];
  loading?: boolean;
}

export function WorkspaceRelatedFiles({ files, loading }: WorkspaceRelatedFilesProps) {
  if (!files.length && !loading) return null;

  return (
    <div className="p-4 border-t border-[#2a2a2a]">
      <h3 className="text-foreground-secondary text-sm font-medium mb-3">
        最近上传的文档
      </h3>
      
      {loading ? (
        <div className="h-[100px]">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-2 text-sm text-muted-foreground"
            >
              <FileText size={14} />
              <span className="truncate flex-1">{file.file_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 