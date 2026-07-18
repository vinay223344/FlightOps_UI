import api from './axiosInstance';
import type {
  ApiResponse,
  HandlingRequestDto,
  HandlingRequestResponse,
  RequestStatus,
} from '../types';

export const handlingRequestsApi = {
  async list(airline?: string): Promise<HandlingRequestResponse[]> {
    const res = await api.get<ApiResponse<HandlingRequestResponse[]>>(
      '/api/handling-requests',
      { params: airline ? { airline } : undefined },
    );
    return res.data.data;
  },
  async listByUserId(userId: string): Promise<HandlingRequestResponse[]> {
    const res = await api.get<ApiResponse<HandlingRequestResponse[]>>(
      `/api/handling-requests/byUser/${userId}`,
    );
    return res.data.data;
  },

  async getById(id: string): Promise<HandlingRequestResponse> {
    const res = await api.get<ApiResponse<HandlingRequestResponse>>(
      `/api/handling-requests/${id}`,
    );
    return res.data.data;
  },

  async listByFlight(flightId: string): Promise<HandlingRequestResponse[]> {
    const res = await api.get<ApiResponse<HandlingRequestResponse[]>>(
      `/api/handling-requests/flight/${flightId}`,
    );
    return res.data.data;
  },

  async create(payload: HandlingRequestDto): Promise<HandlingRequestResponse> {
    const res = await api.post<ApiResponse<HandlingRequestResponse>>(
      '/api/handling-requests',
      payload,
    );
    return res.data.data;
  },

  async updateStatus(
    id: string,
    status: RequestStatus,
  ): Promise<HandlingRequestResponse> {
    const res = await api.patch<ApiResponse<HandlingRequestResponse>>(
      `/api/handling-requests/${id}/status`,
      { status },
    );
    return res.data.data;
  },
};
