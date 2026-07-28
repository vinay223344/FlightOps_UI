import { useCallback } from 'react';
import { baggageApi, mishandledApi } from '../api/baggageApi';
import type {
  BaggageOperationResponse,
  MishandledBaggageResponse,
} from '../types';
import { useAsyncData } from './useAsyncData';

export function useBaggageOps() {
  const fetcher = useCallback(() => baggageApi.list(), []);
  const { data, loading, error, reload } = useAsyncData<
    BaggageOperationResponse[]
  >(fetcher);
  return { operations: data ?? [], loading, error, reload };
}

export function useMishandled() {
  const fetcher = useCallback(() => mishandledApi.list(), []);
  const { data, loading, error, reload } = useAsyncData<
    MishandledBaggageResponse[]
  >(fetcher);
  return { records: data ?? [], loading, error, reload };
}


