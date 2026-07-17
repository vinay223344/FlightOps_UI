/**
 * Central axios instance with JWT handling.
 *
 * Request  interceptor: attaches `Authorization: Bearer <accessToken>`.
 * Response interceptor: on a 401 it transparently calls /api/auth/refresh
 *   (which returns a RAW { accessToken, refreshToken } — NOT the ApiResponse
 *   envelope), stores the new access token and replays the original request.
 *   Concurrent 401s share a single in-flight refresh call. If refresh fails,
 *   the session is cleared and the app is redirected to /login.
 */
import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { storageService } from '../services/storageService';
import type { RefreshTokenResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/** Bare client for the refresh call so it never triggers the interceptors. */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- session-expiry notification -------------------------------------------
type SessionExpiredHandler = () => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

/** AuthContext registers here so it can clear state + navigate on hard logout. */
export function onSessionExpired(handler: SessionExpiredHandler): void {
  sessionExpiredHandler = handler;
}

function forceLogout(): void {
  storageService.clear();
  if (sessionExpiredHandler) {
    sessionExpiredHandler();
  } else {
    window.location.assign('/login');
  }
}

// --- request interceptor ----------------------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storageService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- single-flight refresh --------------------------------------------------
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = storageService.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  // NOTE: /api/auth/refresh returns the bare token object, not ApiResponse<T>.
  const { data } = await refreshClient.post<RefreshTokenResponse>(
    '/api/auth/refresh',
    { refreshToken },
  );
  if (!data?.accessToken) {
    throw new Error('Refresh response missing accessToken');
  }
  storageService.setAccessToken(data.accessToken);
  if (data.refreshToken) {
    storageService.setRefreshToken(data.refreshToken);
  }
  return data.accessToken;
}

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// --- response interceptor ---------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    const isAuthCall =
      url.includes('/api/auth/login') || url.includes('/api/auth/refresh');

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
