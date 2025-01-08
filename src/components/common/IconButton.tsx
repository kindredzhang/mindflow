import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export function IconButton({ 
  icon: Icon, 
  size = 14, 
  className = '', 
  ...props 
}: IconButtonProps) {
  return (
    <button
      className={`
        p-1.5 rounded-md hover:bg-muted 
        transition-all active:scale-95
        ${className}
      `}
      {...props}
    >
      <Icon size={size} />
    </button>
  );
} 