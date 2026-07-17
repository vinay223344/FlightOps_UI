import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button } from 'react-bootstrap';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Reset the boundary when this key changes (e.g. route path). */
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/** Catches render-time errors so a single broken page can't blank the app. */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidUpdate(prev: ErrorBoundaryProps): void {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: '' });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the stack in dev tools without crashing the tree.
    console.error('ErrorBoundary caught an error', error, info);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Alert variant="danger" className="m-4">
          <Alert.Heading className="h6">Something went wrong</Alert.Heading>
          <p className="small mb-3">
            This page hit an unexpected error. You can try again or navigate
            elsewhere.
          </p>
          <p className="small text-muted font-monospace mb-3">
            {this.state.message}
          </p>
          <Button size="sm" variant="outline-danger" onClick={this.handleReset}>
            Try again
          </Button>
        </Alert>
      );
    }
    return this.props.children;
  }
}
