import React from 'react';

/**
 * Unified Card Component with Aurora Glass Effect
 * Provides consistent styling across the entire application
 */
const UnifiedCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  loading = false,
  onClick,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'aurora':
        return `
          bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/80 
          backdrop-blur-sm border border-white/20 shadow-xl
          ${hover ? 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-300' : ''}
        `;
      case 'glass':
        return `
          bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
          ${hover ? 'hover:bg-white/20 hover:shadow-xl transition-all duration-300' : ''}
        `;
      case 'solid':
        return `
          bg-white border border-gray-200 shadow-md
          ${hover ? 'hover:shadow-lg hover:border-gray-300 transition-all duration-300' : ''}
        `;
      case 'dark':
        return `
          bg-gray-800 border border-gray-700 shadow-lg text-white
          ${hover ? 'hover:bg-gray-700 hover:shadow-xl transition-all duration-300' : ''}
        `;
      case 'success':
        return `
          bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 
          backdrop-blur-sm border border-green-200/50 shadow-lg
          ${hover ? 'hover:shadow-xl hover:scale-[1.01] transition-all duration-300' : ''}
        `;
      case 'warning':
        return `
          bg-gradient-to-br from-yellow-50/80 via-orange-50/60 to-amber-50/80 
          backdrop-blur-sm border border-yellow-200/50 shadow-lg
          ${hover ? 'hover:shadow-xl hover:scale-[1.01] transition-all duration-300' : ''}
        `;
      case 'error':
        return `
          bg-gradient-to-br from-red-50/80 via-pink-50/60 to-rose-50/80 
          backdrop-blur-sm border border-red-200/50 shadow-lg
          ${hover ? 'hover:shadow-xl hover:scale-[1.01] transition-all duration-300' : ''}
        `;
      case 'info':
        return `
          bg-gradient-to-br from-blue-50/80 via-cyan-50/60 to-sky-50/80 
          backdrop-blur-sm border border-blue-200/50 shadow-lg
          ${hover ? 'hover:shadow-xl hover:scale-[1.01] transition-all duration-300' : ''}
        `;
      default:
        return `
          bg-gradient-to-br from-gray-50/80 via-white/60 to-gray-50/80 
          backdrop-blur-sm border border-gray-200/50 shadow-lg
          ${hover ? 'hover:shadow-xl hover:scale-[1.01] transition-all duration-300' : ''}
        `;
    }
  };

  const baseStyles = `
    rounded-xl p-6 relative overflow-hidden
    ${onClick ? 'cursor-pointer' : ''}
    ${loading ? 'animate-pulse' : ''}
  `;

  return (
    <div 
      className={`${baseStyles} ${getVariantStyles()} ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Aurora effect overlay for enhanced visual appeal */}
      {variant === 'aurora' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-50 pointer-events-none" />
      )}
      
      {/* Loading skeleton overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * Skeleton Loader Component for better UX
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  variant = 'default' 
}) => {
  return (
    <UnifiedCard variant={variant} loading className={className}>
      <div className="animate-pulse space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index}
            className={`h-4 bg-gray-300/50 rounded ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </div>
    </UnifiedCard>
  );
};

/**
 * Card Header Component
 */
export const CardHeader = ({ 
  title, 
  subtitle, 
  icon, 
  action,
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="text-2xl">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

/**
 * Card Content Component
 */
export const CardContent = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 */
export const CardFooter = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200/50 ${className}`}>
      {children}
    </div>
  );
};

export default UnifiedCard;
