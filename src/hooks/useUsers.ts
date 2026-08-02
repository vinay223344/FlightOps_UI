import { useCallback } from 'react';
import { usersApi } from '../api/usersApi';
import type { PagedResponse, UserResponse } from '../types';
import { useAsyncData } from './useAsyncData';

export function useUsers(page = 1, limit = 10) {
  const fetcher = useCallback(() => usersApi.list(page, limit), [page, limit]);
  const { data, loading, error, reload } =
    useAsyncData<PagedResponse<UserResponse>>(fetcher);
  return {
    users: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    currentPage: data?.currentPage ?? page,
    loading,
    error,
    reload,
  };
}
