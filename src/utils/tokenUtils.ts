/** Small helpers for reading a JWT without pulling in a dependency. */
import type { AuthUser, JwtPayload } from '../types';

/** Base64url-decode + JSON-parse the JWT payload. Returns null on any failure. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** True when the token is missing or its `exp` is in the past (with skew). */
export function isTokenExpired(token: string | null, skewSeconds = 10): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + skewSeconds;
}

/** Build the app's AuthUser from a decoded access token, if possible. */
export function userFromToken(token: string | null): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  return {
    userId: payload.userId,
    email: payload.sub,
    role: payload.role,
  };
}
