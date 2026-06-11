// src/lib/use-async-data.ts — Sprint 5.8
// Unified loading/error/data state + retry handler.

import { useEffect, useState, useCallback } from 'react';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: unknown;
  retry: () => void;
};

/**
 * Wrap any async data-fetcher. Returns state + a stable retry() function.
 * Use with the <ErrorState/> component for consistent failure UX.
 *
 * Example:
 *   const { data, loading, error, retry } = useAsyncData(() => fetchUniversities(), []);
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorState error={error} onRetry={retry} context="universities" />;
 *   return <List items={data} />;
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [nonce, setNonce] = useState(0);

  const retry = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return { data, loading, error, retry };
}
