import api from './axiosInstance';
import type {
  ApiResponse,
  AuditLogFilters,
  AuditLogRequest,
  AuditLogResponse,
} from '../types';

export const auditApi = {
  async list(filters: AuditLogFilters = {}): Promise<AuditLogResponse[]> {
    const params: Record<string, string> = {};
    if (filters.userEmail) params.userEmail = filters.userEmail;
    if (filters.entityType) params.entityType = filters.entityType;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    const res = await api.get<ApiResponse<AuditLogResponse[]>>('/api/audit', {
      params,
    });
    return res.data.data;
  },

  async create(payload: AuditLogRequest): Promise<AuditLogResponse> {
    const res = await api.post<ApiResponse<AuditLogResponse>>(
      '/api/audit',
      payload,
    );
    return res.data.data;
  },
};
