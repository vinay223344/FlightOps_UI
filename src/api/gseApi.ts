import api from './axiosInstance';
import type {
  ApiResponse,
  EquipmentAllocationRequest,
  EquipmentAllocationResponse,
  EquipmentMaintenanceRequest,
  EquipmentMaintenanceResponse,
  EquipmentStatus,
  GroundEquipmentRequest,
  GroundEquipmentResponse,
} from '../types';

export const equipmentApi = {
  async list(): Promise<GroundEquipmentResponse[]> {
    const res =
      await api.get<ApiResponse<GroundEquipmentResponse[]>>('/api/equipment');
    return res.data.data;
  },

  async getById(id: string): Promise<GroundEquipmentResponse> {
    const res = await api.get<ApiResponse<GroundEquipmentResponse>>(
      `/api/equipment/${id}`,
    );
    return res.data.data;
  },

  async listAvailable(): Promise<GroundEquipmentResponse[]> {
    const res = await api.get<ApiResponse<GroundEquipmentResponse[]>>(
      '/api/equipment/available',
    );
    return res.data.data;
  },

  async create(
    payload: GroundEquipmentRequest,
  ): Promise<GroundEquipmentResponse> {
    const res = await api.post<ApiResponse<GroundEquipmentResponse>>(
      '/api/equipment',
      payload,
    );
    return res.data.data;
  },

  async updateStatus(
    id: string,
    status: EquipmentStatus,
  ): Promise<GroundEquipmentResponse> {
    const res = await api.patch<ApiResponse<GroundEquipmentResponse>>(
      `/api/equipment/${id}/status`,
      { status },
    );
    return res.data.data;
  },
};

export const allocationsApi = {
  async list(): Promise<EquipmentAllocationResponse[]> {
    const res =
      await api.get<ApiResponse<EquipmentAllocationResponse[]>>(
        '/api/allocations',
      );
    return res.data.data;
  },

  async listByFlight(flightId: string): Promise<EquipmentAllocationResponse[]> {
    const res = await api.get<ApiResponse<EquipmentAllocationResponse[]>>(
      `/api/allocations/flight/${flightId}`,
    );
    return res.data.data;
  },

  async create(
    payload: EquipmentAllocationRequest,
  ): Promise<EquipmentAllocationResponse> {
    const res = await api.post<ApiResponse<EquipmentAllocationResponse>>(
      '/api/allocations',
      payload,
    );
    return res.data.data;
  },

  async release(id: string): Promise<EquipmentAllocationResponse> {
    const res = await api.patch<ApiResponse<EquipmentAllocationResponse>>(
      `/api/allocations/${id}/release`,
    );
    return res.data.data;
  },
};

export const maintenanceApi = {
  async list(): Promise<EquipmentMaintenanceResponse[]> {
    const res =
      await api.get<ApiResponse<EquipmentMaintenanceResponse[]>>(
        '/api/maintenance',
      );
    return res.data.data;
  },

  async create(
    payload: EquipmentMaintenanceRequest,
  ): Promise<EquipmentMaintenanceResponse> {
    const res = await api.post<ApiResponse<EquipmentMaintenanceResponse>>(
      '/api/maintenance',
      payload,
    );
    return res.data.data;
  },

  async resolve(id: string): Promise<EquipmentMaintenanceResponse> {
    const res = await api.patch<ApiResponse<EquipmentMaintenanceResponse>>(
      `/api/maintenance/${id}/resolve`,
    );
    return res.data.data;
  },
};
