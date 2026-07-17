import { useCallback } from 'react';
import { assistanceApi, countersApi, gatesApi } from '../api/passengerApi';
import type {
  BoardingGateResponse,
  CheckInCounterResponse,
  SpecialAssistanceResponse,
} from '../types';
import { useAsyncData } from './useAsyncData';

export function useCounters() {
  const fetcher = useCallback(() => countersApi.list(), []);
  const { data, loading, error, reload } = useAsyncData<
    CheckInCounterResponse[]
  >(fetcher);
  return { counters: data ?? [], loading, error, reload };
}

export function useGates() {
  const fetcher = useCallback(() => gatesApi.list(), []);
  const { data, loading, error, reload } =
    useAsyncData<BoardingGateResponse[]>(fetcher);
  return { gates: data ?? [], loading, error, reload };
}

export function useAssistance() {
  const fetcher = useCallback(() => assistanceApi.list(), []);
  const { data, loading, error, reload } = useAsyncData<
    SpecialAssistanceResponse[]
  >(fetcher);
  return { requests: data ?? [], loading, error, reload };
}
