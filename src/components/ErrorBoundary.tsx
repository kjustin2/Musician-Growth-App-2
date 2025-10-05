import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details in development only
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
    }
    
    // In production, send sanitized error reports to monitoring service
    if (import.meta.env.PROD) {
      // TODO: Integrate with error monitoring service (e.g., Sentry)
      // Only send non-sensitive error information
      const sanitizedError = {
        message: 'Application error occurred',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      console.warn('Error boundary caught error (production)');
      // sendToErrorReporting(sanitizedError);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 border border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              We apologize for the inconvenience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>

          {/* Show detailed error only in development */}
          {isDevelopment && error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Development Error Details:
              </h3>
              <p className="text-xs text-red-700 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={resetError}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;