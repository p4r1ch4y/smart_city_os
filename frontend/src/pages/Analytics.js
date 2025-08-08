import React from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon } from '@heroicons/react/24/outline';

function Analytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Predictive analytics and insights
        </p>
      </div>

      <div className="card">
        <div className="card-body text-center py-12">
          <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Predictive Analytics
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            This page will contain AI-powered analytics and predictions
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Analytics;
