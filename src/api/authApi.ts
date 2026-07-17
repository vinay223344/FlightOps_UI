import api from './axiosInstance';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
} from '../types';

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>(
      '/api/auth/login',
      payload,
    );
    return res.data.data;
  },

  async register(payload: RegisterRequest): Promise<string> {
    const res = await api.post<ApiResponse<unknown>>(
      '/api/auth/register',
      payload,
    );
    return res.data.message;
  },

  /** Refresh returns a RAW token object (no ApiResponse envelope). */
  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    const res = await api.post<RefreshTokenResponse>('/api/auth/refresh', {
      refreshToken,
    });
    return res.data;
  },
};
