import { useCallback } from 'react';
import { handlingRequestsApi } from '../api/handlingRequestsApi';
import type { HandlingRequestResponse } from '../types';
import { useAsyncData } from './useAsyncData';

export function useHandlingRequests(airline?: string) {
  const fetcher = useCallback(
    () => handlingRequestsApi.list(airline),
    [airline],
  );
  const { data, loading, error, reload } = useAsyncData<
    HandlingRequestResponse[]
  >(fetcher);
  return { requests: data ?? [], loading, error, reload };
}
