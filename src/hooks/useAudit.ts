import { useCallback, useMemo } from 'react';
import { auditApi } from '../api/auditApi';
import type { AuditLogFilters, AuditLogResponse, PagedResponse } from '../types';
import { useAsyncData } from './useAsyncData';

export function useAudit(filters: AuditLogFilters, page = 1, limit = 10) {
  const key = JSON.stringify(filters);
  // Stabilise the fetcher on the serialised filter values.
  const stableFilters = useMemo<AuditLogFilters>(() => JSON.parse(key), [key]);
  const fetcher = useCallback(
    () => auditApi.list(stableFilters, page, limit),
    [stableFilters, page, limit],
  );
  const { data, loading, error, reload } =
    useAsyncData<PagedResponse<AuditLogResponse>>(fetcher);
  return {
    logs: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    currentPage: data?.currentPage ?? page,
    loading,
    error,
    reload,
  };
}
