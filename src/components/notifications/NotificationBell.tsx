import { IconBell, IconCheck, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Dropdown } from 'react-bootstrap';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelative } from '../../utils/dateUtils';
import StatusBadge from '../common/StatusBadge';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } =
    useNotifications();

  const recent = notifications.slice(0, 12);

  return (
    <Dropdown align="end">
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
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{ width: 340, maxHeight: 460, overflowY: 'auto' }}
        className="shadow"
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <span className="fw-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none"
              onClick={() => void markAllRead()}
            >
              Mark all read
            </Button>
          )}
        </div>

        {recent.length === 0 && (
          <div className="text-center text-muted small py-4">
            You're all caught up.
          </div>
        )}

        {recent.map((n) => (
          <div
            key={n.notificationId}
            className={`px-3 py-2 border-bottom small ${
              n.status === 'Unread' ? 'bg-light' : ''
            }`}
          >
            <div className="d-flex justify-content-between align-items-start gap-2">
              <StatusBadge status={n.category} label={n.category} />
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                {formatRelative(n.createdDate)}
              </span>
            </div>
            <div className="my-1">{n.message}</div>
            <div className="d-flex gap-2">
              {n.status === 'Unread' && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="py-0 px-1"
                  onClick={() => void markRead(n.notificationId)}
                >
                  <IconCheck size={14} /> Read
                </Button>
              )}
              <Button
                variant="outline-danger"
                size="sm"
                className="py-0 px-1"
                onClick={() => void dismiss(n.notificationId)}
              >
                <IconTrash size={14} />
              </Button>
            </div>
          </div>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
