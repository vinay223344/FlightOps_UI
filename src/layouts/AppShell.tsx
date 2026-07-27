import { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="fo-shell d-flex flex-column">
      <TopNavbar
        portalTitle={title}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
      <div className="d-flex flex-grow-1">
        <div className="d-none d-lg-block">
          <Sidebar items={navItems} />
        </div>
        <Offcanvas
          show={sidebarOpen}
          onHide={() => setSidebarOpen(false)}
          className="fo-sidebar-offcanvas bg-transparent border-0 p-0 d-lg-none"
          style={{ width: 'var(--fo-sidebar-width)' }}
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title className="fo-brand text-white">
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <Sidebar items={navItems} onNavigate={() => setSidebarOpen(false)} />
          </Offcanvas.Body>
        </Offcanvas>
        <main className="fo-main">
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
