import { Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ROLE_NAV } from '../constants/navigation';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { roleLabel } from '../utils/roleUtils';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

interface AppShellProps {
  /** Overrides the derived portal title (defaults to the role label). */
  portalTitle?: string;
}

/** Navbar + sidebar + routed content. Nav is derived from the active role. */
export default function AppShell({ portalTitle }: AppShellProps) {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role as Role;
  const navItems = role ? ROLE_NAV[role] : [];
  const title = portalTitle ?? `${roleLabel(role)} Portal`;

  return (
    <div className="fo-shell d-flex flex-column">
      <TopNavbar portalTitle={title} />
      <div className="d-flex flex-grow-1">
        <Sidebar items={navItems} />
        <main className="fo-main">
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
