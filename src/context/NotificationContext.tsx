import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { notificationsApi } from '../api/notificationsApi';
import type { NotificationResponse } from '../types';
import { useAuth } from './AuthContext';

const POLL_INTERVAL_MS = 30_000;

interface NotificationContextValue {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      if (mountedRef.current) setNotifications(data);
    } catch {
      // Polling errors are non-fatal — keep the last known list silently.
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated]);

  const markRead = useCallback(async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === id ? { ...n, status: 'Read' } : n,
      ),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
  }, []);

  const dismiss = useCallback(async (id: string) => {
    await notificationsApi.dismiss(id);
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.status === 'Unread').length,
    [notifications],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      refresh,
      markRead,
      markAllRead,
      dismiss,
    }),
    [notifications, unreadCount, loading, refresh, markRead, markAllRead, dismiss],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  return ctx;
}
