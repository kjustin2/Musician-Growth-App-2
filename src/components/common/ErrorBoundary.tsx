import React, { Component, ReactNode } from 'react'
import { logger } from '@/utils/logger'

interface Props {
  children: ReactNode
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Use comprehensive logging system
    logger.logReactError(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo)
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We encountered an unexpected error. The development team has been notified.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-left max-w-2xl">
              <summary className="cursor-pointer text-red-800 font-medium mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-red-700 overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          
          <div className="space-x-4">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}