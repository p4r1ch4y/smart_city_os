import React from 'react';
import { Icon } from './icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    // Example: Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;
      
      // Use custom fallback if provided
      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mb-6">
              <Icon name="error" size={64} className="mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                We're sorry, but something unexpected happened. Please try again.
              </p>
            </div>

            {showDetails && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Details:
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Icon name="refresh" size={16} />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Icon name="refresh" size={16} />
                <span>Reload Page</span>
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Developer Information
                </summary>
                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, fallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Lightweight error fallback for smaller components
export const ErrorFallback = ({ error, retry, className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
    <Icon name="error" size={32} className="text-red-500 mb-3" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Something went wrong
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      {error?.message || 'An unexpected error occurred'}
    </p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
    >
      <Icon name="refresh" size={16} />
      <span>Try Again</span>
    </button>
  </div>
);

export default ErrorBoundary;
