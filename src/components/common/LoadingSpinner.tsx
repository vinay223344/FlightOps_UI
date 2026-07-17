import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  label?: string;
  /** Fill available vertical space and centre. */
  fullHeight?: boolean;
}

export default function LoadingSpinner({
  label = 'Loading…',
  fullHeight = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center text-muted gap-2 ${
        fullHeight ? 'py-5' : 'py-4'
      }`}
      style={fullHeight ? { minHeight: '40vh' } : undefined}
    >
      <Spinner animation="border" variant="primary" role="status" />
      <span className="small">{label}</span>
    </div>
  );
}
