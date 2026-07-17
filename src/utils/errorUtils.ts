/** Normalises any thrown value into a user-facing message. */
import { AxiosError } from 'axios';
import type { ApiErrorBody } from '../types';

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body) {
      if (body.errors && Object.keys(body.errors).length > 0) {
        return Object.values(body.errors).join(' ');
      }
      if (body.message) return body.message;
      if (body.error) return body.error;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Is the backend running on port 8080?';
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
