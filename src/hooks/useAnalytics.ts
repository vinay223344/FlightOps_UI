import { useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import type {
  DashboardMetricsResponse,
  GroundOpsReportResponse,
} from '../types';
import { useAsyncData } from './useAsyncData';

const DASHBOARD_POLL_MS = 60_000;

export function useDashboardMetrics(poll = true) {
  const fetcher = useCallback(() => analyticsApi.dashboard(), []);
  const { data, loading, error, reload } =
    useAsyncData<DashboardMetricsResponse>(fetcher, {
      pollMs: poll ? DASHBOARD_POLL_MS : 0,
    });
  return { metrics: data, loading, error, reload };
}

export function useReports() {
  const fetcher = useCallback(() => analyticsApi.listReports(), []);
  const { data, loading, error, reload } = useAsyncData<
    GroundOpsReportResponse[]
  >(fetcher);
  return { reports: data ?? [], loading, error, reload };
}
