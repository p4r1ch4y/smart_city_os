import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  subtitle, 
  trend, 
  trendValue,
  className = '' 
}) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      icon: 'text-primary-600 dark:text-primary-400',
      border: 'border-primary-200 dark:border-primary-800'
    },
    success: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      icon: 'text-success-600 dark:text-success-400',
      border: 'border-success-200 dark:border-success-800'
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      icon: 'text-warning-600 dark:text-warning-400',
      border: 'border-warning-200 dark:border-warning-800'
    },
    danger: {
      bg: 'bg-danger-50 dark:bg-danger-900/20',
      icon: 'text-danger-600 dark:text-danger-400',
      border: 'border-danger-200 dark:border-danger-800'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    }
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div
      className={`stat-card ${className}`}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="stat-label truncate">{title}</p>
          <div className="flex items-baseline space-x-1 sm:space-x-2">
            <p className="stat-value text-xl sm:text-2xl lg:text-3xl truncate">{value}</p>
            {trendValue && (
              <span className={`text-xs sm:text-sm font-medium ${
                trend === 'up' ? 'text-success-600 dark:text-success-400' : 
                trend === 'down' ? 'text-danger-600 dark:text-danger-400' : 
                'text-gray-500 dark:text-gray-400'
              }`}>
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0 ml-2 sm:ml-4">
          <div className={`p-2 sm:p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${colors.icon}`} />
          </div>
          
          {trend && (
            <div className={`flex items-center space-x-1 ${
              trend === 'up' ? 'text-success-600 dark:text-success-400' : 
              trend === 'down' ? 'text-danger-600 dark:text-danger-400' : 
              'text-gray-500 dark:text-gray-400'
            }`}>
              {trend === 'up' ? (
                <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : trend === 'down' ? (
                <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : null}
              <span className="text-xs font-medium">
                {trend === 'up' ? 'Good' : trend === 'down' ? 'Alert' : 'Stable'}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
