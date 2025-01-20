import { MessageActions } from '@/components/chat/message/MessageActions';
import { MessageAvatar } from '@/components/chat/message/MessageAvatar';
import { MessageContent } from '@/components/chat/message/MessageContent';
import { LoadingDots } from '@/components/common/LoadingDots';
import type { Message } from '@/types';
import { useState } from 'react';
import { RelatedFiles } from './RelatedFiles';

interface ChatMessageProps {
  message: Message & {
    relatedFiles?: Array<{
      file_id: number;
      file_name: string;
      similarity: number;
      source_type: string;
      created_at: string;
      file_type: string;
    }>;
  };
  onDelete: (id: string) => void;
  onQuote: (messageId: string, content: string, role: 'user' | 'assistant') => void;
  onCopy: (content: string) => void;
  onSpeak: (content: string) => void;
  onScrollToMessage?: (messageId: string) => void;
}

export function ChatMessage({ message, onDelete, onQuote, onCopy, onSpeak, onScrollToMessage }: ChatMessageProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(message.id), 300);
  };

  const handleQuoteClick = (quotedMessageId: string) => {
    onScrollToMessage?.(quotedMessageId);
  };

  return (
    <div 
      id={`message-${message.id}`}
      className={`
        group space-y-2 
        transition-all duration-300 ease-in-out
        ${isDeleting ? 'opacity-0 transform translate-y-3' : 'opacity-100'}
      `}
    >
      <div className="flex items-start gap-3">
        <MessageAvatar role={message.role} />
        <div className="relative flex-1 min-w-0">
          <div className={`
            rounded-2xl p-4
            ${message.role === 'user' 
              ? 'bg-primary/10 text-foreground' 
              : 'bg-card/60 text-foreground/90'
            }
          `}>
            {message.content ? (
              <MessageContent content={message.content} />
            ) : (
              <LoadingDots />
            )}
            {/* 展示引用消息 */}
            {message.quoted_message && (
              <div 
                className="mt-2 pt-2 border-t border-primary/20 cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => handleQuoteClick(message.quoted_message!.id)}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {message.quoted_message.role === 'user' ? '引用用户的消息:' : '回复上文:'}
                </div>
                <div className="pl-2 border-l-2 border-primary/30 text-sm text-muted-foreground">
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-0 prose-ul:my-1 prose-li:my-0 prose-blockquote:my-1">
                    <MessageContent content={message.quoted_message.content} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <MessageActions 
            content={message.content}
            messageId={message.id}
            role={message.role}
            onDelete={handleDelete}
            onQuote={onQuote}
          />
          {message.relatedFiles && (
            <RelatedFiles files={message.relatedFiles} />
          )}
        </div>
      </div>
    </div>
  );
} 