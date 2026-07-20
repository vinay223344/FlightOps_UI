import { useCallback } from 'react';
import { assistanceApi, countersApi, gatesApi } from '../api/passengerApi';
import type {
  BoardingGateResponse,
  CheckInCounterResponse,
  SpecialAssistanceResponse,
} from '../types';
import { useAsyncData } from './useAsyncData';

export function useCounters(userId?: string) {
  const fetcher = useCallback(() => {
    if (userId) {
      return countersApi.listByUserID(userId);
    }
    return countersApi.list();
  }, [userId]);
  const { data, loading, error, reload } = useAsyncData<
    CheckInCounterResponse[]
  >(fetcher);
  return { counters: data ?? [], loading, error, reload };
}

export function useGates(userId?: string) {
  const fetcher = useCallback(() => {
    if (userId) {
      return gatesApi.listByUserID(userId);
    }
    return gatesApi.list();
  }, [userId]);
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

export function useAssistanceByUserId(userId?: string) {
  const fetcher = useCallback(() => {
    if (userId) {
      return assistanceApi.getByUserId(userId);
    }
    return assistanceApi.list();
  }, [userId]);
  const { data, loading, error, reload } = useAsyncData<
    SpecialAssistanceResponse[]
  >(fetcher);
  return { requests: data ?? [], loading, error, reload };
}
