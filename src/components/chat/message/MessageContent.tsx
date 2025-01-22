import { CopyButton } from '@/components/common/CopyButton';
import 'katex/dist/katex.min.css';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type {
  CodeProps,
  ErrorBlockProps,
} from './types';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  const components: Partial<Components> = {
    // 保留基础文本格式
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="text-sm leading-relaxed text-foreground/90 mb-3 last:mb-0 break-words whitespace-pre-wrap">
        {children}
      </p>
    ),
    
    // 保留代码相关
    code: ({ inline, className, children }: CodeProps) => {
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
                showLineNumbers={true}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }
      return <code className="bg-muted/50 px-1.5 py-0.5 text-sm rounded font-mono break-words">{children}</code>;
    },

    // 保留错误显示
    error: ({ code, description, solution, reference }: ErrorBlockProps) => (
      <div className="bg-destructive/10 text-destructive/90 p-4 rounded-md my-3">
        <div className="font-medium">{code}</div>
        <div>{description}</div>
        {solution && <div className="mt-2">Solution: {solution}</div>}
        {reference && (
          <a href={reference} className="text-primary hover:underline mt-2 block">
            Learn more
          </a>
        )}
      </div>
    ),

    // 保留基础列表样式
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="text-sm list-disc pl-6 mb-3 space-y-1 text-foreground/90">
        {children}
      </ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="text-sm list-decimal pl-6 mb-3 space-y-1 text-foreground/90">
        {children}
      </ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="leading-relaxed">{children}</li>
    ),

    // 保留标题样式
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-xl font-semibold text-foreground mb-4 mt-6">
        {children}
      </h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-lg font-semibold text-foreground mb-3 mt-5">
        {children}
      </h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-base font-semibold text-foreground mb-3 mt-4">
        {children}
      </h3>
    ),

    // 保留表格样式
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full divide-y divide-border border border-border rounded-md">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="px-4 py-2 text-left text-sm font-medium text-foreground/90 bg-muted">
        {children}
      </th>
    ),
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="px-4 py-2 text-sm text-foreground/80">
        {children}
      </td>
    ),
  };

  return (
    <div className="prose prose-sm max-w-full overflow-hidden prose-pre:my-0 prose-p:my-0 prose-headings:my-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 