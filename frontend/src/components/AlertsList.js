import React from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function AlertsList({ alerts = [], compact = false, onAlertClick }) {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-danger-600 bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800',
      high: 'text-warning-600 bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
      medium: 'text-primary-600 bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800',
      low: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'medium':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <CheckCircleIcon className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm font-medium">No active alerts</p>
        <p className="text-xs">All systems are operating normally</p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '2' : '4'}`}>
      {alerts.map((alert, index) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`border rounded-lg p-${compact ? '3' : '4'} ${getSeverityColor(alert.severity)} cursor-pointer hover:shadow-md transition-all duration-200`}
          onClick={() => onAlertClick?.(alert)}
        >
          <div className="flex items-start space-x-3">
            {/* Severity icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getSeverityIcon(alert.severity)}
            </div>

            {/* Alert content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={`${compact ? 'text-sm' : 'text-base'} font-medium truncate`}>
                    {alert.title}
                  </h4>
                  
                  {!compact && alert.description && (
                    <p className="text-sm opacity-80 mt-1 line-clamp-2">
                      {alert.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2">
                    {/* Sensor info */}
                    {alert.sensor && (
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-3 h-3 opacity-60" />
                        <span className="text-xs opacity-80 truncate">
                          {alert.sensor.name}
                        </span>
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3 opacity-60" />
                      <span className="text-xs opacity-80">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Severity badge */}
                <div className="flex-shrink-0 ml-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200' :
                    alert.severity === 'high' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200' :
                    alert.severity === 'medium' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Alert data preview */}
              {!compact && alert.data && (
                <div className="mt-3 p-2 bg-black/5 dark:bg-white/5 rounded text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(alert.data).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="opacity-70 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status indicators */}
              {!compact && (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/20">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.status === 'active' ? 'bg-current animate-pulse' : 'bg-current/50'
                    }`} />
                    <span className="text-xs opacity-80 capitalize">
                      {alert.status}
                    </span>
                  </div>
                  
                  {alert.priority && (
                    <span className="text-xs opacity-60">
                      Priority: {alert.priority}/10
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default AlertsList;
