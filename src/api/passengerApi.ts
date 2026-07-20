import api from './axiosInstance';
import type {
  ApiResponse,
  AssistanceAssignRequest,
  BoardingGateRequest,
  BoardingGateResponse,
  CheckInCounterRequest,
  CheckInCounterResponse,
  CounterStatus,
  GateStatus,
  SpecialAssistanceRequest,
  SpecialAssistanceResponse,
} from '../types';

export const countersApi = {
  async list(): Promise<CheckInCounterResponse[]> {
    const res =
      await api.get<ApiResponse<CheckInCounterResponse[]>>('/api/counters');
    return res.data.data;
  },

  async listByUserID(userId: string): Promise<CheckInCounterResponse[]> {
    const res = await api.get<ApiResponse<CheckInCounterResponse[]>>(
      `/api/counters/byUser/${userId}`,
    );
    return res.data.data;
  },

  async listByFlight(flightId: string): Promise<CheckInCounterResponse[]> {
    const res = await api.get<ApiResponse<CheckInCounterResponse[]>>(
      `/api/counters/flight/${flightId}`,
    );
    return res.data.data;
  },

  async create(
    payload: CheckInCounterRequest,
  ): Promise<CheckInCounterResponse> {
    const res = await api.post<ApiResponse<CheckInCounterResponse>>(
      '/api/counters',
      payload,
    );
    return res.data.data;
  },

  async updateStatus(
    id: string,
    status: CounterStatus,
  ): Promise<CheckInCounterResponse> {
    const res = await api.patch<ApiResponse<CheckInCounterResponse>>(
      `/api/counters/${id}/status`,
      { status },
    );
    return res.data.data;
  },
};

export const gatesApi = {
  async list(): Promise<BoardingGateResponse[]> {
    const res = await api.get<ApiResponse<BoardingGateResponse[]>>('/api/gates');
    return res.data.data;
  },

  async listByUserID(userId: string): Promise<BoardingGateResponse[]> {
    const res = await api.get<ApiResponse<BoardingGateResponse[]>>(
      `/api/gates/byUser/${userId}`,
    );
    return res.data.data;
  },

  async listByFlight(flightId: string): Promise<BoardingGateResponse[]> {
    const res = await api.get<ApiResponse<BoardingGateResponse[]>>(
      `/api/gates/flight/${flightId}`,
    );
    return res.data.data;
  },

  async create(payload: BoardingGateRequest): Promise<BoardingGateResponse> {
    const res = await api.post<ApiResponse<BoardingGateResponse>>(
      '/api/gates',
      payload,
    );
    return res.data.data;
  },

  async updateStatus(
    id: string,
    status: GateStatus,
  ): Promise<BoardingGateResponse> {
    const res = await api.patch<ApiResponse<BoardingGateResponse>>(
      `/api/gates/${id}/status`,
      { status },
    );
    return res.data.data;
  },
};

export const assistanceApi = {
  async list(): Promise<SpecialAssistanceResponse[]> {
    const res = await api.get<ApiResponse<SpecialAssistanceResponse[]>>(
      '/api/special-assistance',
    );
    return res.data.data;
  },

  async create(
    payload: SpecialAssistanceRequest,
  ): Promise<SpecialAssistanceResponse> {
    const res = await api.post<ApiResponse<SpecialAssistanceResponse>>(
      '/api/special-assistance',
      payload,
    );
    return res.data.data;
  },

  getByUserId: async (userId: string): Promise<SpecialAssistanceResponse[]> => {
    const response = await api.get(`/api/special-assistance/byUser/${userId}`);
    return response.data.data;
  },

  async assign(
    id: string,
    payload: AssistanceAssignRequest,
  ): Promise<SpecialAssistanceResponse> {
    const res = await api.patch<ApiResponse<SpecialAssistanceResponse>>(
      `/api/special-assistance/${id}/assign`,
      payload,
    );
    return res.data.data;
  },

  async complete(id: string): Promise<SpecialAssistanceResponse> {
    const res = await api.patch<ApiResponse<SpecialAssistanceResponse>>(
      `/api/special-assistance/${id}/complete`,
    );
    return res.data.data;
  },
};
