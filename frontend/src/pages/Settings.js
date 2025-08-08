import React from 'react';
import { motion } from 'framer-motion';
import { CogIcon } from '@heroicons/react/24/outline';

function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          System configuration and preferences
        </p>
      </div>

      <div className="card">
        <div className="card-body text-center py-12">
          <CogIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            System Settings
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            This page will contain system configuration options
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Settings;
