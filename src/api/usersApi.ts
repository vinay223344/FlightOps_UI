import api from './axiosInstance';
import type {
  ApiResponse,
  CreateUserRequest,
  PagedResponse,
  UpdateUserRequest,
  UserResponse,
  UserStatus,
} from '../types';

export const usersApi = {
  async list(page = 1, limit = 10): Promise<PagedResponse<UserResponse>> {
    const res = await api.get<ApiResponse<PagedResponse<UserResponse>>>(
      '/api/users',
      { params: { page, limit } },
    );
    return res.data.data;
  },

  async getById(id: string): Promise<UserResponse> {
    const res = await api.get<ApiResponse<UserResponse>>(`/api/users/${id}`);
    return res.data.data;
  },

  async create(payload: CreateUserRequest): Promise<UserResponse> {
    const res = await api.post<ApiResponse<UserResponse>>(
      '/api/users',
      payload,
    );
    return res.data.data;
  },

  async update(id: string, payload: UpdateUserRequest): Promise<UserResponse> {
    const res = await api.put<ApiResponse<UserResponse>>(
      `/api/users/${id}`,
      payload,
    );
    return res.data.data;
  },

  async updateStatus(id: string, status: UserStatus): Promise<UserResponse> {
    const res = await api.patch<ApiResponse<UserResponse>>(
      `/api/users/${id}/status`,
      { status },
    );
    return res.data.data;
  },
};
