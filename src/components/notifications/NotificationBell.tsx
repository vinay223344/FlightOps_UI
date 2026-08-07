import { IconBell, IconCheck, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Dropdown } from 'react-bootstrap';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelative } from '../../utils/dateUtils';
import StatusBadge from '../common/StatusBadge';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } =
    useNotifications();
  const recent = notifications.slice(0, 12);

  const isMobile = window.innerWidth <= 375;

  return (
    <Dropdown align={isMobile ? 'end' : 'end'}>
      <Dropdown.Toggle
        variant="link"
        id="notification-bell"
        className="text-white position-relative p-1 border-0 shadow-none"
      >
        <IconBell size={22} />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="fo-notif-badge position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.6rem' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu
        style={{
          width: 'min(280px, calc(100vw - 16px))',
          maxHeight: '60vh',
          overflowY: 'auto',
          fontSize: '0.78rem',
          // On mobile, anchor to right edge of screen
          ...(isMobile && {
            position: 'fixed',
            top: '56px',       // adjust to match your navbar height
            right: '8px',
            left: 'auto',
          }),
        }}
        className="shadow"
      >
        <div className="d-flex justify-content-between align-items-center px-2 py-1 border-bottom">
          <span className="fw-semibold" style={{ fontSize: '0.8rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none"
              style={{ fontSize: '0.72rem' }}
              onClick={() => void markAllRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        {recent.length === 0 && (
          <div className="text-center text-muted py-3" style={{ fontSize: '0.78rem' }}>
            You're all caught up.
          </div>
        )}
        {recent.map((n) => (
          <div
            key={n.notificationId}
            className={`px-2 py-1 border-bottom ${
              n.status === 'Unread' ? 'bg-light' : ''
            }`}
          >
            <div className="d-flex justify-content-between align-items-start gap-1">
              <StatusBadge status={n.category} label={n.category} />
              <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                {formatRelative(n.createdDate)}
              </span>
            </div>
            <div className="my-1 text-break" style={{ fontSize: '0.75rem' }}>
              {n.message}
            </div>
            <div className="d-flex gap-1">
              {n.status === 'Unread' && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="py-0 px-1"
                  style={{ fontSize: '0.68rem' }}
                  onClick={() => void markRead(n.notificationId)}
                >
                  <IconCheck size={11} /> Read
                </Button>
              )}
              <Button
                variant="outline-danger"
                size="sm"
                className="py-0 px-1"
                onClick={() => void dismiss(n.notificationId)}
              >
                <IconTrash size={11} />
              </Button>
            </div>
          </div>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}