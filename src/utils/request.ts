import { toast } from '@/hooks/use-toast';

interface RequestConfig {
  successMessage?: string;  // 成功时的提示信息
  errorMessage?: string;    // 失败时的提示信息
  showSuccessToast?: boolean; // 是否显示成功提示
  showErrorToast?: boolean;   // 是否显示错误提示
}

export async function handleRequest<T>(
  requestFn: () => Promise<T>,
  config: RequestConfig = {}
): Promise<T> {
  const {
    successMessage = '操作成功',
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
  } = config;

  try {
    const response = await requestFn();
    
    if (showSuccessToast) {
      toast({
        title: successMessage,
        variant: "default",
      });
    }
    
    return response;
  } catch (error) {
    if (showErrorToast) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : (errorMessage || '未知错误'),
        variant: "destructive",
      });
    }
    throw error;
  }
} 