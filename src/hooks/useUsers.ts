import { useCallback } from 'react';
import { usersApi } from '../api/usersApi';
import type { UserResponse } from '../types';
import { useAsyncData } from './useAsyncData';

export function useUsers() {
  const fetcher = useCallback(() => usersApi.list(), []);
  const { data, loading, error, reload } =
    useAsyncData<UserResponse[]>(fetcher);
  return { users: data ?? [], loading, error, reload };
}
