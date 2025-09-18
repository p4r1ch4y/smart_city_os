import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { alertService } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { Icon, StatusIcon } from '../components/icons';
import LoadingSpinner from '../components/LoadingSpinner';

function Alerts() {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { getActiveAlerts } = useSocket();

  // Fetch alerts
  const { data: alertsData, isLoading } = useQuery(
    ['alerts', selectedSeverity],
    () => alertService.getAlerts({
      severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
      limit: 50
    }),
    {
      refetchInterval: 30000,
      onError: () => {
        return { data: { alerts: getActiveAlerts() } };
      }
    }
  );

  // Acknowledge alert mutation
  const acknowledgeMutation = useMutation(
    ({ id, notes }) => alertService.acknowledgeAlert(id, notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['alerts']);
        toast.success('Alert acknowledged successfully');
      },
      onError: () => {
        toast.error('Failed to acknowledge alert');
      }
    }
  );

  const alerts = alertsData?.data?.alerts || getActiveAlerts();

  // Filter alerts based on search term
  const filteredAlerts = alerts.filter(alert =>
    alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.sensorId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const severityOptions = [
    { value: 'all', label: 'All Alerts', count: alerts.length },
    { value: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
    { value: 'high', label: 'High', count: alerts.filter(a => a.severity === 'high').length },
    { value: 'medium', label: 'Medium', count: alerts.filter(a => a.severity === 'medium').length },
    { value: 'low', label: 'Low', count: alerts.filter(a => a.severity === 'low').length },
  ];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading alerts..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Alert Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage system alerts across all city infrastructure
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIcon status="success" size={16} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            System Monitoring Active
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Severity Filter */}
          <div className="flex flex-wrap gap-2">
            {severityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedSeverity(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedSeverity === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center"
            >
              <Icon name="success" size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Alerts Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No alerts match your search criteria.' : 'All systems are operating normally.'}
              </p>
            </motion.div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 shadow-sm border-gray-200 dark:border-gray-700 p-6 ${
                  alert.severity === 'critical' ? 'border-l-red-500' :
                  alert.severity === 'high' ? 'border-l-orange-500' :
                  alert.severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <Icon name={getSeverityIcon(alert.severity)} size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {alert.type || 'System Alert'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {alert.message || 'No message available'}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Icon name="time" size={16} />
                          <span>{formatTimestamp(alert.timestamp || Date.now())}</span>
                        </div>
                        {alert.sensorId && (
                          <div className="flex items-center space-x-1">
                            <Icon name="sensors" size={16} />
                            <span>{alert.sensorId}</span>
                          </div>
                        )}
                        {alert.location && (
                          <div className="flex items-center space-x-1">
                            <Icon name="location" size={16} />
                            <span>{alert.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {alert.status !== 'acknowledged' && (
                      <button
                        onClick={() => acknowledgeMutation.mutate({ id: alert.id, notes: 'Acknowledged via dashboard' })}
                        disabled={acknowledgeMutation.isLoading}
                        className="px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        {acknowledgeMutation.isLoading ? 'Acknowledging...' : 'Acknowledge'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Alerts;
