import { useCallback, useEffect, useRef } from 'react';
import { QueryClient, QueryKey } from '@tanstack/react-query';

const DEFAULT_INVALIDATION_DELAY_MS = 250;

export function useBatchedQueryInvalidation(
  queryClient: QueryClient,
  delayMs = DEFAULT_INVALIDATION_DELAY_MS,
) {
  const pendingKeysRef = useRef(new Map<string, QueryKey>());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    const pendingKeys = [...pendingKeysRef.current.values()];
    pendingKeysRef.current.clear();
    timeoutRef.current = null;

    pendingKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryClient]);

  const scheduleInvalidations = useCallback((queryKeys: QueryKey[]) => {
    queryKeys.forEach((queryKey) => {
      pendingKeysRef.current.set(JSON.stringify(queryKey), queryKey);
    });

    if (timeoutRef.current) return;
    timeoutRef.current = setTimeout(flush, delayMs);
  }, [delayMs, flush]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return scheduleInvalidations;
}
