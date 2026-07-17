import type { Role } from './enums';

/** Decoded JWT access-token payload. `sub` is the user's email. */
export interface JwtPayload {
  sub: string;
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

/** The authenticated user identity kept in context + storage. */
export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}
