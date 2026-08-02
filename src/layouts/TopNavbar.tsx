import {
  IconLogout,
  IconMenu2,
  IconPlaneTilt,
  IconUserCircle,
} from '@tabler/icons-react';
import { Dropdown, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/notifications/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { roleLabel } from '../utils/roleUtils';

interface TopNavbarProps {
  portalTitle: string;
  onToggleSidebar?: () => void;
}

export default function TopNavbar({
  portalTitle,
  onToggleSidebar,
}: TopNavbarProps) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  return (
    <Navbar bg="dark" variant="dark" className="fo-navbar px-3 shadow-sm">
      <button
        type="button"
        className="fo-sidebar-toggle btn btn-link text-white p-1 me-2 border-0"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <IconMenu2 size={22} />
      </button>
      <Navbar.Brand className="fo-brand d-flex align-items-center gap-2 mb-0">
        <IconPlaneTilt size={22} />
        <span>FlightOps</span>
        <span className="text-white fw-normal d-none d-md-inline">
          · {portalTitle}
        </span>
      </Navbar.Brand>

      <div className="ms-auto d-flex align-items-center gap-3">
        <NotificationBell />
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            id="user-menu"
            className="text-white text-decoration-none d-flex align-items-center gap-2 border-0 shadow-none"
          >
            <IconUserCircle size={24} />
            <span className="d-none d-md-inline text-start lh-1">
              <span className="d-block small">{user?.email}</span>
              <span
                className="d-block text-secondary"
                style={{ fontSize: '0.7rem' }}
              >
                {roleLabel(user?.role)}
              </span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow">
            <Dropdown.ItemText className="small text-muted">
              Signed in as
              <div className="fw-semibold text-dark">{user?.email}</div>
            </Dropdown.ItemText>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>
              <IconLogout size={16} className="me-2" />
              Sign out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </Navbar>
  );
}
