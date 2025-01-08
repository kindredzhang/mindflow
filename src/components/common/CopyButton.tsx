import { Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CopyButtonProps {
  content: string;
  className?: string;
}

export function CopyButton({ content, className = '' }: CopyButtonProps) {
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopying(true);
      toast.success('已复制到剪贴板');
      
      // 重置动画状态
      setTimeout(() => setCopying(false), 300);
    } catch {
      toast.error('复制失败');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        p-1.5 rounded-md hover:bg-muted 
        transition-all active:scale-95
        ${copying ? 'scale-95 bg-muted' : ''}
        ${className}
      `}
    >
      <Copy size={14} className="text-muted-foreground" />
    </button>
  );
} 