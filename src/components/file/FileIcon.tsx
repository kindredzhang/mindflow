import { FileText } from 'lucide-react';

interface FileIconProps {
  fileName: string;
  size?: number;
  className?: string;
}

export function FileIcon({ fileName, size = 14, className = '' }: FileIconProps) {
  return <FileText size={size} className={className} />;
} 