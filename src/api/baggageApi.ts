import api from './axiosInstance';
import type {
  ApiResponse,
  BaggageOperationRequest,
  BaggageOperationResponse,
  MishandledBaggageRequest,
  MishandledBaggageResponse,
  MishandledStatus,
} from '../types';

export const baggageApi = {
  async list(): Promise<BaggageOperationResponse[]> {
    const res =
      await api.get<ApiResponse<BaggageOperationResponse[]>>('/api/baggage-ops');
    return res.data.data;
  },

  async listByFlight(flightId: string): Promise<BaggageOperationResponse[]> {
    const res = await api.get<ApiResponse<BaggageOperationResponse[]>>(
      `/api/baggage-ops/flight/${flightId}`,
    );
    return res.data.data;
  },

  async create(
    payload: BaggageOperationRequest,
  ): Promise<BaggageOperationResponse> {
    const res = await api.post<ApiResponse<BaggageOperationResponse>>(
      '/api/baggage-ops',
      payload,
    );
    return res.data.data;
  },

  async updateCount(
    id: string,
    totalBagsProcessed: number,
  ): Promise<BaggageOperationResponse> {
    const res = await api.patch<ApiResponse<BaggageOperationResponse>>(
      `/api/baggage-ops/${id}/count`,
      { totalBagsProcessed },
    );
    return res.data.data;
  },

  async complete(id: string): Promise<BaggageOperationResponse> {
    const res = await api.patch<ApiResponse<BaggageOperationResponse>>(
      `/api/baggage-ops/${id}/complete`,
    );
    return res.data.data;
  },
};

export const mishandledApi = {
  async list(): Promise<MishandledBaggageResponse[]> {
    const res =
      await api.get<ApiResponse<MishandledBaggageResponse[]>>('/api/mishandled');
    return res.data.data;
  },

  async getByBagTag(bagTag: string): Promise<MishandledBaggageResponse> {
    const res = await api.get<ApiResponse<MishandledBaggageResponse>>(
      `/api/mishandled/${bagTag}`,
    );
    return res.data.data;
  },

  async create(
    payload: MishandledBaggageRequest,
  ): Promise<MishandledBaggageResponse> {
    const res = await api.post<ApiResponse<MishandledBaggageResponse>>(
      '/api/mishandled',
      payload,
    );
    return res.data.data;
  },

  async updateStatus(
    id: string,
    status: MishandledStatus,
  ): Promise<MishandledBaggageResponse> {
    const res = await api.patch<ApiResponse<MishandledBaggageResponse>>(
      `/api/mishandled/${id}/status`,
      { status },
    );
    return res.data.data;
  },
};
