import { IconAlertCircle } from '@tabler/icons-react';
import { Alert, Button } from 'react-bootstrap';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="danger" className="d-flex align-items-start gap-2">
      <IconAlertCircle size={22} className="flex-shrink-0 mt-1" />
      <div className="flex-grow-1">
        <div className="fw-semibold">Failed to load data</div>
        <div className="small">{message}</div>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline-danger" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Alert>
  );
}
