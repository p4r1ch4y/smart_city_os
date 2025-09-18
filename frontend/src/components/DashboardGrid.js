import React from 'react';
import { motion } from 'framer-motion';

/**
 * Modern Dashboard Grid System
 * Provides responsive, consistent layout for dashboard components
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Grid Container
export function DashboardContainer({ children, className = "" }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Stats Grid (for metric cards)
export function StatsGrid({ children, className = "" }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Main Content Grid (2/3 + 1/3 layout)
export function MainContentGrid({ children, className = "" }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Full Width Section
export function FullWidthSection({ children, className = "" }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Two Column Grid
export function TwoColumnGrid({ children, className = "" }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Three Column Grid
export function ThreeColumnGrid({ children, className = "" }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Card Component with consistent styling
export function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  className = "",
  headerAction = null,
  loading = false,
  error = null
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Card Header */}
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-red-500 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

// Metric Card Component
export function MetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = "blue",
  className = "" 
}) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
  };

  const trendClasses = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400"
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {unit && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unit}
              </p>
            )}
          </div>
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trendClasses[trend]}`}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                vs yesterday
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Chart Container
export function ChartContainer({ 
  title, 
  subtitle, 
  children, 
  height = "h-80",
  className = "",
  headerAction = null 
}) {
  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      headerAction={headerAction}
      className={className}
    >
      <div className={`w-full ${height}`}>
        {children}
      </div>
    </DashboardCard>
  );
}

// Alert Banner
export function AlertBanner({ type = "info", title, message, onDismiss, className = "" }) {
  const typeClasses = {
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
    success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
    error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-lg border p-4 ${typeClasses[type]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 text-current opacity-70 hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default {
  DashboardContainer,
  StatsGrid,
  MainContentGrid,
  FullWidthSection,
  TwoColumnGrid,
  ThreeColumnGrid,
  DashboardCard,
  MetricCard,
  ChartContainer,
  AlertBanner
};
