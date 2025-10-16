import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import healthCheck from '../utils/healthCheck';

const DebugPanel = ({ isOpen, onClose }) => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const results = await healthCheck.runAllChecks();
      setHealthStatus(results);
    } catch (error) {
      setHealthStatus({
        overall: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'auth_required':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Debug Panel</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={runHealthCheck}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Running health checks...</span>
            </div>
          ) : healthStatus ? (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="p-4 rounded-lg border">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthStatus.overall)}
                  <span className="font-medium">
                    Overall Status: {healthStatus.overall}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Individual Checks */}
              {healthStatus.checks && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Service Health</h4>
                  
                  {Object.entries(healthStatus.checks).map(([service, result]) => (
                    <div key={service} className="p-3 rounded-lg border bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(result.status)}
                          <span className="font-medium capitalize">
                            {service.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {result.status}
                        </span>
                      </div>
                      
                      {result.error && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {result.error}
                        </div>
                      )}
                      
                      {result.data && (
                        <div className="mt-2 text-sm text-gray-600">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {result.serviceTypes && (
                        <div className="mt-2 text-sm text-gray-600">
                          Service types available: {result.serviceTypes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Environment Info */}
              <div className="p-4 rounded-lg border bg-blue-50">
                <h4 className="font-medium text-gray-900 mb-2">Environment</h4>
                <div className="text-sm space-y-1">
                  <div>API URL: {process.env.REACT_APP_API_URL || 'Default'}</div>
                  <div>WebSocket URL: {process.env.REACT_APP_WS_URL || 'Default'}</div>
                  <div>Node Environment: {process.env.NODE_ENV}</div>
                  <div>Build Time: {process.env.REACT_APP_BUILD_TIME || 'Unknown'}</div>
                </div>
              </div>

              {/* Local Storage Info */}
              <div className="p-4 rounded-lg border bg-yellow-50">
                <h4 className="font-medium text-gray-900 mb-2">Local Storage</h4>
                <div className="text-sm space-y-1">
                  <div>Auth Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
                  <div>Theme: {localStorage.getItem('theme') || 'Default'}</div>
                  <div>City: {localStorage.getItem('selectedCity') || 'Default'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click refresh to run health checks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;