import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Session } from '@/types/workspace';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';

interface SessionItemProps {
  session: Session;
  isSelected: boolean;
  onSelect: (session: Session) => void;
  onDelete: () => void;
  onRename: () => void;
}

export function SessionItem({
  session,
  isSelected,
  onSelect,
  onDelete,
  onRename
}: SessionItemProps) {
  return (
    <div
      data-session-id={session.session_id}
      className={`relative w-full p-1.5 rounded-md transition-colors ${
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'bg-background text-foreground hover:bg-background/80'
      }`}
      onClick={() => onSelect(session)}
    >
      <div className="absolute left-[-1.25rem] top-1/2 w-3 h-px bg-border" />
      
      <div className="flex items-center space-x-2">
        <MessageSquare size={14} className="flex-shrink-0" />
        <div className="flex-1 min-w-0 flex items-center justify-between cursor-pointer">
          <p className="text-sm truncate">
            {session.session_title}
          </p>
          <div className="flex items-center space-x-1">
            <button
              className="p-1 hover:bg-background/80 rounded-sm"
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
            >
              <Pencil size={12} className="text-muted-foreground hover:text-foreground" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  className="p-1 hover:bg-destructive/10 rounded-sm ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 size={12} className="text-destructive" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除会话</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除这个会话吗？此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
} 