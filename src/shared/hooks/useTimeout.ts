import { useCallback, useEffect, useRef } from "react";

interface UseTimeoutReturn {
  startTimeout: (callback: () => void, delay: number) => void;
  stopTimeout: () => void;
}

/**
 * Хук для управления таймером setTimeout.
 * Автоматически очищает таймер при размонтировании компонента.
 */
export function useTimeout(): UseTimeoutReturn {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimeout = useCallback(
    (callback: () => void, delay: number) => {
      // Очищаем предыдущий таймер, если он был запущен
      stopTimeout();

      timeoutRef.current = setTimeout(() => {
        callback();
        timeoutRef.current = null;
      }, delay);
    },
    [stopTimeout],
  );

  useEffect(() => {
    return stopTimeout;
  }, [stopTimeout]);

  return { startTimeout, stopTimeout };
}
