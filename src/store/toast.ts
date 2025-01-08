import { toast } from '@/hooks/use-toast';
import { create } from 'zustand';

interface ToastState {
  show: (options: {
    title?: string;
    description: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }) => void;
}

export const useToastStore = create<ToastState>(() => ({
  show: ({ title, description, variant = 'default', duration = 3000 }) => {
    toast({
      title,
      description,
      variant,
      duration,
    });
  },
}));

// 导出便捷方法
export const showToast = useToastStore.getState().show; 