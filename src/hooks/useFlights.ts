import { useCallback } from 'react';
import { flightsApi } from '../api/flightsApi';
import type { FlightResponse } from '../types';
import { useAsyncData } from './useAsyncData';

const FLIGHTS_POLL_MS = 60_000;

/** Lists flights (optionally filtered by airline), auto-refreshing every 60s. */
export function useFlights(airline?: string, poll = true) {
  const fetcher = useCallback(
    () => flightsApi.list(airline),
    [airline],
  );
  const { data, loading, error, reload } = useAsyncData<FlightResponse[]>(
    fetcher,
    { pollMs: poll ? FLIGHTS_POLL_MS : 0 },
  );
  return { flights: data ?? [], loading, error, reload };
}

export function useFlight(id: string | undefined) {
  const fetcher = useCallback(() => flightsApi.getById(id as string), [id]);
  const { data, loading, error, reload } = useAsyncData<FlightResponse>(
    fetcher,
    { enabled: !!id },
  );
  return { flight: data, loading, error, reload };
}
