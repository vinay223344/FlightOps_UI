import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/authApi';
import { onSessionExpired } from '../api/axiosInstance';
import { storageService } from '../services/storageService';
import type { AuthUser, LoginRequest } from '../types';
import { isTokenExpired, userFromToken } from '../utils/tokenUtils';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const logout = useCallback(() => {
    storageService.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const login = useCallback(async (payload: LoginRequest): Promise<AuthUser> => {
    const auth = await authApi.login(payload);
    const authUser: AuthUser = {
      userId: auth.userId,
      email: auth.email,
      role: auth.role,
    };
    storageService.setSession(auth.accessToken, auth.refreshToken, authUser);
    setUser(authUser);
    setStatus('authenticated');
    return authUser;
  }, []);

  // Rehydrate the session on first mount.
  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      const accessToken = storageService.getAccessToken();
      const storedUser = storageService.getUser();

      if (accessToken && !isTokenExpired(accessToken) && storedUser) {
        if (!cancelled) {
          setUser(storedUser);
          setStatus('authenticated');
        }
        return;
      }

      const refreshToken = storageService.getRefreshToken();
      if (refreshToken) {
        try {
          const tokens = await authApi.refresh(refreshToken);
          storageService.setAccessToken(tokens.accessToken);
          if (tokens.refreshToken) {
            storageService.setRefreshToken(tokens.refreshToken);
          }
          const resolved =
            storedUser ?? userFromToken(tokens.accessToken) ?? null;
          if (resolved) storageService.setUser(resolved);
          if (!cancelled) {
            setUser(resolved);
            setStatus(resolved ? 'authenticated' : 'unauthenticated');
          }
          return;
        } catch {
          storageService.clear();
        }
      }

      if (!cancelled) {
        setUser(null);
        setStatus('unauthenticated');
      }
    }

    void rehydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // When the axios interceptor gives up on refresh, drop the session.
  useEffect(() => {
    onSessionExpired(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated' && !!user,
      login,
      logout,
    }),
    [user, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
