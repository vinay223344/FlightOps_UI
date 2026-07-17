import { useCallback, useMemo } from 'react';
import { auditApi } from '../api/auditApi';
import type { AuditLogFilters, AuditLogResponse } from '../types';
import { useAsyncData } from './useAsyncData';

export function useAudit(filters: AuditLogFilters) {
  const key = JSON.stringify(filters);
  // Stabilise the fetcher on the serialised filter values.
  const stableFilters = useMemo<AuditLogFilters>(() => JSON.parse(key), [key]);
  const fetcher = useCallback(
    () => auditApi.list(stableFilters),
    [stableFilters],
  );
  const { data, loading, error, reload } =
    useAsyncData<AuditLogResponse[]>(fetcher);
  return { logs: data ?? [], loading, error, reload };
}
