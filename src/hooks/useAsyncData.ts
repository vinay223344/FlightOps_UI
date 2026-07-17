import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errorUtils';

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: (updater: T | ((prev: T | null) => T)) => void;
}

interface UseAsyncDataOptions {
  /** Re-run the fetcher on this millisecond interval (0 = disabled). */
  pollMs?: number;
  /** Skip fetching entirely (e.g. when a required id is missing). */
  enabled?: boolean;
}

/**
 * Generic data-fetching hook: runs `fetcher`, tracks loading/error, and
 * exposes a `reload`. Optionally polls. The fetcher identity controls refetch.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions = {},
): UseAsyncDataResult<T> {
  const { pollMs = 0, enabled = true } = options;
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setDataState(result);
    } catch (err) {
      if (mountedRef.current) setError(getErrorMessage(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pollMs || !enabled) return;
    const timer = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(timer);
  }, [pollMs, enabled, load]);

  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setDataState((prev) =>
      typeof updater === 'function'
        ? (updater as (prev: T | null) => T)(prev)
        : updater,
    );
  }, []);

  return { data, loading, error, reload: load, setData };
}
