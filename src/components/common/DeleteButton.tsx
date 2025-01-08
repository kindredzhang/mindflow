import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteButtonProps {
  onDelete: () => void;
  className?: string;
}

export function DeleteButton({ onDelete, className = '' }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete();
      setIsDeleting(false);
    }, 300);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`
        p-1.5 rounded-md hover:bg-muted 
        transition-all active:scale-95
        ${isDeleting ? 'opacity-50' : ''}
        ${className}
      `}
    >
      <Trash2 size={14} className="text-destructive" />
    </button>
  );
} 