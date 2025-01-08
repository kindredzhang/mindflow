import type { FileUploadHistory } from '@/services/api/file';
import { FileIcon } from './FileIcon';

interface FileListProps {
  files: FileUploadHistory[];
  maxDisplay?: number;
  emptyText?: string;
  className?: string;
}

export function FileList({ 
  files = [], 
  maxDisplay = 5,
  emptyText = '暂无文件',
  className = ''
}: FileListProps) {
  const validFiles = Array.isArray(files) ? files : [];
  
  return (
    <div className={className}>
      {validFiles.length > 0 ? (
        <div className="space-y-2">
          {validFiles.slice(0, maxDisplay).map((file) => (
            <div 
              key={`file-${file.id}`}
              className="flex items-center space-x-2 text-foreground-secondary text-sm"
            >
              <FileIcon fileName={file.file_name} />
              <span className="truncate">{file.file_name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground">
          <FileIcon fileName="" size={24} className="mb-2 opacity-50" />
          <span>{emptyText}</span>
        </div>
      )}
    </div>
  );
} 