import { useCallback } from 'react';
import { handlingRequestsApi } from '../api/handlingRequestsApi';
import type { HandlingRequestResponse } from '../types';
import { useAsyncData } from './useAsyncData';

export function useHandlingRequests(userId?: string) {
  const fetcher = useCallback(() => {
    if (userId) {
      return handlingRequestsApi.listByUserId(userId);
    }
    return handlingRequestsApi.list();
  }, [userId]);

  const { data, loading, error, reload } =
    useAsyncData<HandlingRequestResponse[]>(fetcher);

  return {
    requests: data ?? [],
    loading,
    error,
    reload,
  };
}