import { useCallback, useRef } from 'react';

interface DebounceOptions {
  wait?: number;        // 防抖等待时间（毫秒）
  leading?: boolean;    // 是否在延迟开始前调用
  trailing?: boolean;   // 是否在延迟结束后调用
}

/**
 * 通用防抖 Hook
 * @param fn 需要防抖的函数
 * @param options 防抖配置选项
 * @returns 防抖处理后的函数
 */
export function useDebounce<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  options: DebounceOptions = {}
) {
  const { 
    wait = 300,        // 默认300ms
    leading = false,   // 默认首次不执行
    trailing = true    // 默认结束后执行
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fnRef = useRef(fn);
  const leadingRef = useRef(true);  // 用于记录是否是第一次调用

  // 更新最新的函数引用
  fnRef.current = fn;

  return useCallback((...args: Parameters<typeof fn>) => {
    const shouldExecuteNow = leadingRef.current && leading;
    
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (shouldExecuteNow) {
      leadingRef.current = false;
      fnRef.current(...args);
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        fnRef.current(...args);
      }
      leadingRef.current = true;
      timeoutRef.current = null;
    }, wait);
  }, [wait, leading, trailing]);
}