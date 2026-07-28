import api from './axiosInstance';
import type {
  ApiResponse,
  FlightRequest,
  FlightResponse,
  FlightStatus,
} from '../types';

export const flightsApi = {
  async list(airline?: string): Promise<FlightResponse[]> {
    const res = await api.get<ApiResponse<FlightResponse[]>>('/api/flights', {
      params: airline ? { airline } : undefined,
    });
    return res.data.data;
  },

  async getById(id: string): Promise<FlightResponse> {
    const res = await api.get<ApiResponse<FlightResponse>>(`/api/flights/${id}`);
    return res.data.data;
  },

  async create(payload: FlightRequest): Promise<FlightResponse> {
    const res = await api.post<ApiResponse<FlightResponse>>(
      '/api/flights',
      payload,
    );
    return res.data.data;
  },

  async update(id: string, payload: FlightRequest): Promise<FlightResponse> {
    const res = await api.put<ApiResponse<FlightResponse>>(
      `/api/flights/${id}`,
      payload,
    );
    return res.data.data;
  },

  async updateStatus(
    id: string,
    status: FlightStatus,
  ): Promise<FlightResponse> {
    const res = await api.patch<ApiResponse<FlightResponse>>(
      `/api/flights/${id}/status`,
      { status },
    );
    return res.data.data;
  },

  async getByHandlingRequestServiceType(serviceType: string): Promise<FlightResponse[]> {
    const res = await api.get<ApiResponse<FlightResponse[]>>(
      `/api/flights/allByHandlingService`, {params: { serviceType },
    });
    return res.data.data;
  }
};
