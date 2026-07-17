import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { hasAnyRole } from '../utils/roleUtils';

interface RoleRouteProps {
  allow: Role[];
  children: ReactNode;
}

/** Restricts a subtree to specific roles; redirects to /not-authorized. */
export default function RoleRoute({ allow, children }: RoleRouteProps) {
  const { user } = useAuth();
  if (!hasAnyRole(user?.role, allow)) {
    return <Navigate to="/not-authorized" replace />;
  }
  return <>{children}</>;
}
