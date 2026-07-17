import { IconInbox } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'There are no records to display.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center text-muted py-5">
      <div className="mb-2">
        {icon ?? <IconInbox size={40} stroke={1.5} />}
      </div>
      <h6 className="mb-1">{title}</h6>
      <p className="small mb-3">{message}</p>
      {action}
    </div>
  );
}
