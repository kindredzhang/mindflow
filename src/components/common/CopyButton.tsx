import { Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CopyButtonProps {
  content: string;
  className?: string;
  onCopy?: (content: string) => void;
}

export function CopyButton({ content, className = '', onCopy }: CopyButtonProps) {
  const [copying, setCopying] = useState(false);

  const processCopyContent = (content: string) => {
    // 移除所有 markdown 语法标记
    return content
      // 移除代码块标记
      .replace(/```[\s\S]*?```/g, (match) => {
        return match
          .replace(/^```.*?\n/, '') // 移除开始的 ```language
          .replace(/```$/, ''); // 移除结束的 ```
      })
      // 移除内联代码标记
      .replace(/`([^`]+)`/g, '$1')
      // 移除粗体标记
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // 移除斜体标记
      .replace(/\*([^*]+)\*/g, '$1')
      // 移除链接标记
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      // 移除标题标记
      .replace(/#{1,6}\s(.*)/g, '$1')
      // 移除列表标记
      .replace(/^[-*+]\s/gm, '')
      .replace(/^\d+\.\s/gm, '')
      // 移除引用标记
      .replace(/^>\s/gm, '')
      // 移除水平线
      .replace(/^-{3,}|_{3,}|\*{3,}$/gm, '')
      // 替换多个连续空行为单个空行
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // 修剪开头和结尾的空白字符
      .trim();
  };

  const handleCopy = async () => {
    try {
      const processedContent = processCopyContent(content);
      
      // 首先尝试使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(processedContent);
      } else {
        // 后备方案：使用传统的复制方法
        const textarea = document.createElement('textarea');
        textarea.value = processedContent;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopying(true);
      toast.success('已复制到剪贴板');
      if (onCopy) {
        onCopy(processedContent);
      }
      setTimeout(() => setCopying(false), 300);
    } catch (error) {
      console.error('Copy failed:', error);
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