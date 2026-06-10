import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time errors so a single broken component doesn't unmount the
 * whole app. Shows a friendly fallback with a reload button.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-muted-foreground">
            An unexpected error occurred. Try reloading the page — if it keeps
            happening, please contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
