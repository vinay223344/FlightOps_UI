import { useCallback } from 'react';
import { allocationsApi, equipmentApi, maintenanceApi } from '../api/gseApi';
import type {
  EquipmentAllocationResponse,
  EquipmentMaintenanceResponse,
  GroundEquipmentResponse,
  PagedResponse,
} from '../types';
import { useAsyncData } from './useAsyncData';

export function useEquipment(page = 1, limit = 10) {
  const fetcher = useCallback(() => equipmentApi.list(page, limit), [page, limit]);
  const { data, loading, error, reload } =
    useAsyncData<PagedResponse<GroundEquipmentResponse>>(fetcher);
  return {
    equipment: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    currentPage: data?.currentPage ?? page,
    loading,
    error,
    reload,
  };
}

export function useAvailableEquipment() {
  const fetcher = useCallback(() => equipmentApi.listAvailable(), []);
  const { data, loading, error, reload } = useAsyncData<
    GroundEquipmentResponse[]
  >(fetcher);
  return { equipment: data ?? [], loading, error, reload };
}

export function useAllocations(userId?: string) {
  const fetcher = useCallback(() =>
    userId ? allocationsApi.getByUser(userId) : allocationsApi.list(), []);
  const { data, loading, error, reload } = useAsyncData<
    EquipmentAllocationResponse[]
  >(fetcher);
  return { allocations: data ?? [], loading, error, reload };
}

export function useMaintenance() {
  const fetcher = useCallback(() => maintenanceApi.list(), []);
  const { data, loading, error, reload } = useAsyncData<
    EquipmentMaintenanceResponse[]
  >(fetcher);
  return { records: data ?? [], loading, error, reload };
}
