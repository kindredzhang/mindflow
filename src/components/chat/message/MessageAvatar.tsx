import { Bot, User } from 'lucide-react';

interface MessageAvatarProps {
  role: 'user' | 'assistant';
}

export function MessageAvatar({ role }: MessageAvatarProps) {
  return role === 'user' ? (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
      <User size={16} className="text-primary-foreground" />
    </div>
  ) : (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
      <Bot size={16} className="text-primary" />
    </div>
  );
} 