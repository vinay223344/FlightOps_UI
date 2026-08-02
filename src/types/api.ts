/** Generic envelope returned by (almost) every backend endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/** Structured error body produced by the backend GlobalExceptionHandler. */
export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
  errors?: Record<string, string>;
}

/** Standard server-side pagination envelope (mirrors backend PageResponse<T>). */
export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
