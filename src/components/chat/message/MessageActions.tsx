import { CopyButton } from '@/components/common/CopyButton';
import { DeleteButton } from '@/components/common/DeleteButton';
import { IconButton } from '@/components/common/IconButton';
import { SpeakButton } from '@/components/common/SpeakButton';
import { Quote } from 'lucide-react';

interface MessageActionsProps {
  content: string;
  messageId: string;
  role: 'user' | 'assistant';
  onDelete: () => void;
  onQuote: (messageId: string, content: string, role: 'user' | 'assistant') => void;
  onCopy: (content: string) => void;
  onSpeak: (content: string) => void;
}

export function MessageActions({ 
  content, 
  messageId, 
  role, 
  onDelete, 
  onQuote,
  onCopy,
  onSpeak
}: MessageActionsProps) {
  return (
    <div className="absolute left-0 -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
      <CopyButton content={content} onCopy={onCopy} />
      <SpeakButton content={content} onSpeak={onSpeak} />
      <IconButton
        icon={Quote}
        onClick={() => onQuote(messageId, content, role)}
        className="text-muted-foreground"
        title="引用此消息"
      />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
} 