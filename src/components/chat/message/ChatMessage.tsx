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
}

export function ChatMessage({ message, onDelete, onQuote, onCopy, onSpeak }: ChatMessageProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(message.id), 300);
  };

  return (
    <div className={`
      group space-y-2 
      transition-all duration-300 ease-in-out
      ${isDeleting ? 'opacity-0 transform translate-y-3' : 'opacity-100'}
    `}>
      <div className="flex items-start gap-3">
        <MessageAvatar role={message.role} />
        <div className="relative flex-1 min-w-0">
          {message.quotedMessage && (
            <div className="mb-2 pl-4 border-l-2 border-primary/30 text-sm text-muted-foreground">
              <p className="line-clamp-2 break-words">{message.quotedMessage.content}</p>
            </div>
          )}
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