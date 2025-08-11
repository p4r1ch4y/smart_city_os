import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './icons';

function LoadingSpinner({ size = 'md', className = '', text = '', useIcon = true }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 16,
    md: 32,
    lg: 48,
    xl: 64
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {useIcon ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-primary-600"
        >
          <Icon name="loader" size={iconSizes[size]} />
        </motion.div>
      ) : (
        <motion.div
          className={`${sizeClasses[size]} border-2 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {text && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;
