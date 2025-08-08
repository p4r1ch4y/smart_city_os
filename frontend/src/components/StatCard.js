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
        <div className="flex-1">
          <p className="stat-label">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="stat-value">{value}</p>
            {trendValue && (
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-success-600 dark:text-success-400' : 
                trend === 'down' ? 'text-danger-600 dark:text-danger-400' : 
                'text-gray-500 dark:text-gray-400'
              }`}>
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          
          {trend && (
            <div className={`flex items-center space-x-1 ${
              trend === 'up' ? 'text-success-600 dark:text-success-400' : 
              trend === 'down' ? 'text-danger-600 dark:text-danger-400' : 
              'text-gray-500 dark:text-gray-400'
            }`}>
              {trend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : trend === 'down' ? (
                <ArrowDownIcon className="h-4 w-4" />
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
