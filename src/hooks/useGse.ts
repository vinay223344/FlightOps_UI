import { useCallback } from 'react';
import { allocationsApi, equipmentApi, maintenanceApi } from '../api/gseApi';
import type {
  EquipmentAllocationResponse,
  EquipmentMaintenanceResponse,
  GroundEquipmentResponse,
} from '../types';
import { useAsyncData } from './useAsyncData';

export function useEquipment() {
  const fetcher = useCallback(() => equipmentApi.list(), []);
  const { data, loading, error, reload } = useAsyncData<
    GroundEquipmentResponse[]
  >(fetcher);
  return { equipment: data ?? [], loading, error, reload };
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
