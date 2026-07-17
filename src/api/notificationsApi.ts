import api from './axiosInstance';
import type {
  ApiResponse,
  NotificationRequest,
  NotificationResponse,
} from '../types';

export const notificationsApi = {
  async list(): Promise<NotificationResponse[]> {
    const res =
      await api.get<ApiResponse<NotificationResponse[]>>('/api/notifications');
    return res.data.data;
  },

  async listUnread(): Promise<NotificationResponse[]> {
    const res = await api.get<ApiResponse<NotificationResponse[]>>(
      '/api/notifications/unread',
    );
    return res.data.data;
  },

  async create(payload: NotificationRequest): Promise<NotificationResponse> {
    const res = await api.post<ApiResponse<NotificationResponse>>(
      '/api/notifications',
      payload,
    );
    return res.data.data;
  },

  async markRead(id: string): Promise<NotificationResponse> {
    const res = await api.patch<ApiResponse<NotificationResponse>>(
      `/api/notifications/${id}/read`,
    );
    return res.data.data;
  },

  async markAllRead(): Promise<void> {
    await api.patch<ApiResponse<void>>('/api/notifications/read-all');
  },

  async dismiss(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/api/notifications/${id}`);
  },
};
