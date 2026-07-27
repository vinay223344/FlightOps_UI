import { useCallback } from 'react';
import { handlingRequestsApi } from '../api/handlingRequestsApi';
import type { HandlingRequestResponse } from '../types';
import { useAsyncData } from './useAsyncData';

export function useHandlingRequests(userId?: string, filters?: { status?: string; date?: string }) {
  const status = filters?.status ?? '';
  const date = filters?.date ?? '';

  const fetcher = useCallback(() => {
    const activeFilters = { status, date };

    if (userId) {
      return handlingRequestsApi.listByUserId(userId, activeFilters);
    }
    // Pass filters here too in case userId is empty or loading
    return handlingRequestsApi.list();
  }, [userId, status, date]);

  const { data, loading, error, reload } =
    useAsyncData<HandlingRequestResponse[]>(fetcher);

  return {
    requests: data ?? [],
    loading,
    error,
    reload,
  };
}