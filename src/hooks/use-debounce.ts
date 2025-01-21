import { useMemo } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  return useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }, [fn, delay]);
}