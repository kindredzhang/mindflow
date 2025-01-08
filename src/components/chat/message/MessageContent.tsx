import { CopyButton } from '@/components/common/CopyButton';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  const components: Partial<Components> = {
    // 基础文本格式
    p: ({ children }) => (
      <p className="text-sm leading-relaxed text-foreground/90 mb-3 last:mb-0 break-words whitespace-pre-wrap">
        {children}
      </p>
    ),
    
    // 代码相关
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)(:(.+))?/.exec(className || '');
      const language = match?.[1];
      const filepath = match?.[3];
      
      if (!inline && language) {
        return (
          <div className="relative group my-3">
            {filepath && (
              <div className="text-xs text-muted-foreground mb-2 break-words">
                {filepath}
              </div>
            )}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton content={String(children)} />
            </div>
            <div className="overflow-x-auto">
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                PreTag="div"
                className="text-sm rounded-md"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }
      return <code className="bg-muted/50 px-1.5 py-0.5 text-sm rounded font-mono break-words">{children}</code>;
    },

    // 特殊标签渲染
    error: ({ children }) => (
      <div className="bg-destructive/10 text-destructive/90 p-3 rounded-md text-sm my-3">
        {children}
      </div>
    ),
    warning: ({ children }) => (
      <div className="bg-yellow-500/10 text-yellow-600/90 p-3 rounded-md text-sm my-3">
        {children}
      </div>
    ),
    note: ({ children }) => (
      <div className="bg-primary/5 text-primary/90 p-3 rounded-md text-sm my-3">
        {children}
      </div>
    ),
    tip: ({ children }) => (
      <div className="bg-green-500/10 text-green-600/90 p-3 rounded-md text-sm my-3">
        {children}
      </div>
    ),
    cmd: ({ children }) => (
      <div className="relative group bg-card/50 border rounded-md p-3 font-mono text-sm my-3">
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton content={String(children)} />
        </div>
        {children}
      </div>
    ),
    
    // 结构化内容
    steps: ({ children }) => (
      <div className="space-y-2 my-3">
        {children}
      </div>
    ),
    diagnosis: ({ children }) => (
      <div className="bg-blue-500/5 p-4 rounded-md space-y-2 my-3">
        {children}
      </div>
    ),
    compare: ({ children }) => (
      <div className="grid grid-cols-2 gap-4 my-3">
        {children}
      </div>
    ),

    // 列表样式
    ul: ({ children }) => (
      <ul className="text-sm list-disc pl-6 mb-3 space-y-1 text-foreground/90">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="text-sm list-decimal pl-6 mb-3 space-y-1 text-foreground/90">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),

    // 引用和强调
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-muted pl-4 italic text-foreground/75 my-3 break-words">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-medium text-foreground">
        {children}
      </strong>
    ),

    // 标题层级
    h1: ({ children }) => (
      <h1 className="text-xl font-semibold text-foreground mb-4 mt-6">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold text-foreground mb-3 mt-5">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold text-foreground mb-3 mt-4">
        {children}
      </h3>
    ),

    // 链接样式
    a: ({ children, href }) => (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    ),

    // 表格样式
    table: ({ children }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full divide-y divide-border">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-medium text-foreground/90 bg-muted">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-sm text-foreground/80">
        {children}
      </td>
    ),
  };

  return (
    <div className="prose prose-sm max-w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 