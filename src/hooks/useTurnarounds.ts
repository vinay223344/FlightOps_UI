import { useCallback } from 'react';
import { milestonesApi, turnaroundsApi } from '../api/turnaroundsApi';
import type {
  TurnaroundMilestoneResponse,
  TurnaroundPlanResponse,
} from '../types';
import { useAsyncData } from './useAsyncData';

const TURNAROUND_POLL_MS = 60_000;

export function useTurnarounds(activeOnly = false, poll = true) {
  const fetcher = useCallback(
    () => turnaroundsApi.list(activeOnly),
    [activeOnly],
  );
  const { data, loading, error, reload } = useAsyncData<
    TurnaroundPlanResponse[]
  >(fetcher, { pollMs: poll ? TURNAROUND_POLL_MS : 0 });
  return { turnarounds: data ?? [], loading, error, reload };
}

export function useTurnaround(id: string | undefined, poll = true) {
  const fetcher = useCallback(
    () => turnaroundsApi.getById(id as string),
    [id],
  );
  const { data, loading, error, reload } = useAsyncData<TurnaroundPlanResponse>(
    fetcher,
    { enabled: !!id, pollMs: poll ? TURNAROUND_POLL_MS : 0 },
  );
  return { turnaround: data, loading, error, reload };
}

export function useMilestones(planId: string | undefined, poll = true) {
  const fetcher = useCallback(
    () => milestonesApi.listByPlan(planId as string),
    [planId],
  );
  const { data, loading, error, reload } = useAsyncData<
    TurnaroundMilestoneResponse[]
  >(fetcher, { enabled: !!planId, pollMs: poll ? TURNAROUND_POLL_MS : 0 });
  return { milestones: data ?? [], loading, error, reload };
}

export function useDelayedMilestones(poll = true) {
  const fetcher = useCallback(() => milestonesApi.listDelayed(), []);
  const { data, loading, error, reload } = useAsyncData<
    TurnaroundMilestoneResponse[]
  >(fetcher, { pollMs: poll ? TURNAROUND_POLL_MS : 0 });
  return { milestones: data ?? [], loading, error, reload };
}
