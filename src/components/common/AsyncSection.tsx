import type { ReactNode } from 'react';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingSpinner from './LoadingSpinner';

interface AsyncSectionProps {
  loading: boolean;
  error: string | null;
  /** When true (and not loading/error), render the empty state. */
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
  /** Show spinner only on the very first load, not on background reloads. */
  hasData?: boolean;
}

/** Standard loading / error / empty / content switch for data sections. */
export default function AsyncSection({
  loading,
  error,
  isEmpty = false,
  onRetry,
  emptyTitle,
  emptyMessage,
  emptyAction,
  children,
  hasData = false,
}: AsyncSectionProps) {
  if (error && !hasData) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }
  if (loading && !hasData) {
    return <LoadingSpinner />;
  }
  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }
  return <>{children}</>;
}
