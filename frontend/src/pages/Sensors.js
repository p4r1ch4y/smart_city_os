import React from 'react';
import { motion } from 'framer-motion';
import { CpuChipIcon } from '@heroicons/react/24/outline';

function Sensors() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sensors
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor all city sensors
        </p>
      </div>

      <div className="card">
        <div className="card-body text-center py-12">
          <CpuChipIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sensors Management
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            This page will contain detailed sensor management functionality
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Sensors;
