import api from './axiosInstance';
import type {
  ApiResponse,
  MilestoneCompleteRequest,
  TurnaroundMilestoneResponse,
  TurnaroundPlanRequest,
  TurnaroundPlanResponse,
} from '../types';

export const turnaroundsApi = {
  async list(activeOnly = false): Promise<TurnaroundPlanResponse[]> {
    const res = await api.get<ApiResponse<TurnaroundPlanResponse[]>>(
      '/api/turnarounds',
      { params: { activeOnly } },
    );
    return res.data.data;
  },

  async getById(id: string): Promise<TurnaroundPlanResponse> {
    const res = await api.get<ApiResponse<TurnaroundPlanResponse>>(
      `/api/turnarounds/${id}`,
    );
    return res.data.data;
  },

  /** Returns a single plan for the flight (not a list). */
  async getByFlight(flightId: string): Promise<TurnaroundPlanResponse> {
    const res = await api.get<ApiResponse<TurnaroundPlanResponse>>(
      `/api/turnarounds/flight/${flightId}`,
    );
    return res.data.data;
  },

  async create(payload: TurnaroundPlanRequest): Promise<TurnaroundPlanResponse> {
    const res = await api.post<ApiResponse<TurnaroundPlanResponse>>(
      '/api/turnarounds',
      payload,
    );
    return res.data.data;
  },

  /** Marks the plan complete. */
  async complete(id: string): Promise<TurnaroundPlanResponse> {
    const res = await api.patch<ApiResponse<TurnaroundPlanResponse>>(
      `/api/turnarounds/${id}/status`,
    );
    return res.data.data;
  },
};

export const milestonesApi = {
  async listByPlan(planId: string): Promise<TurnaroundMilestoneResponse[]> {
    const res = await api.get<ApiResponse<TurnaroundMilestoneResponse[]>>(
      `/api/milestones/turnaround/${planId}`,
    );
    return res.data.data;
  },

  async getById(id: string): Promise<TurnaroundMilestoneResponse> {
    const res = await api.get<ApiResponse<TurnaroundMilestoneResponse>>(
      `/api/milestones/${id}`,
    );
    return res.data.data;
  },

  async listDelayed(): Promise<TurnaroundMilestoneResponse[]> {
    const res = await api.get<ApiResponse<TurnaroundMilestoneResponse[]>>(
      '/api/milestones/delayed',
    );
    return res.data.data;
  },

  async complete(
    id: string,
    payload: MilestoneCompleteRequest,
  ): Promise<TurnaroundMilestoneResponse> {
    const res = await api.patch<ApiResponse<TurnaroundMilestoneResponse>>(
      `/api/milestones/${id}/complete`,
      payload,
    );
    return res.data.data;
  },
};
