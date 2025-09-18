import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { sensorService } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { Icon, StatusIcon } from '../components/icons';
import LoadingSpinner from '../components/LoadingSpinner';
import SensorMap from '../components/SensorMap';

function Sensors() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const { realtimeData } = useSocket();

  // Fetch sensors
  const { data: sensorsData, isLoading } = useQuery(
    ['sensors', selectedType],
    () => sensorService.getSensors({
      type: selectedType !== 'all' ? selectedType : undefined,
      limit: 100
    }),
    {
      refetchInterval: 30000,
      onError: () => {
        // Generate mock sensor data for demo
        return {
          data: {
            sensors: Array.from({ length: 34 }, (_, i) => ({
              id: `sensor_${String(i + 1).padStart(3, '0')}`,
              type: ['traffic', 'air_quality', 'energy', 'water', 'waste'][i % 5],
              location: `Location ${i + 1}`,
              status: Math.random() > 0.1 ? 'active' : 'inactive',
              lastReading: Date.now() - Math.random() * 3600000,
              value: Math.random() * 100,
              coordinates: {
                lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                lng: -74.0060 + (Math.random() - 0.5) * 0.1
              }
            }))
          }
        };
      }
    }
  );

  const sensors = sensorsData?.data?.sensors || [];

  const sensorTypes = [
    { value: 'all', label: 'All Sensors', icon: 'sensors', count: sensors.length },
    { value: 'traffic', label: 'Traffic', icon: 'traffic', count: sensors.filter(s => s.type === 'traffic').length },
    { value: 'air_quality', label: 'Air Quality', icon: 'airQuality', count: sensors.filter(s => s.type === 'air_quality').length },
    { value: 'energy', label: 'Energy', icon: 'energy', count: sensors.filter(s => s.type === 'energy').length },
    { value: 'water', label: 'Water', icon: 'water', count: sensors.filter(s => s.type === 'water').length },
    { value: 'waste', label: 'Waste', icon: 'waste', count: sensors.filter(s => s.type === 'waste').length },
  ];

  const filteredSensors = selectedType === 'all'
    ? sensors
    : sensors.filter(sensor => sensor.type === selectedType);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    const typeMap = {
      traffic: 'traffic',
      air_quality: 'airQuality',
      energy: 'energy',
      water: 'water',
      waste: 'waste'
    };
    return typeMap[type] || 'sensors';
  };

  const formatTimestamp = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading sensors..." />;
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
            IoT Sensor Network
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage {sensors.length} sensors across the city infrastructure
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIcon status="success" size={16} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sensors.filter(s => s.status === 'active').length} Active
          </span>
        </div>
      </div>

      {/* Sensor Type Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filter by Sensor Type
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {sensorTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedType === type.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon name={type.icon} size={24} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {type.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {type.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sensor Locations
        </h2>
        <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <SensorMap sensors={filteredSensors} height={384} />
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredSensors.map((sensor, index) => (
            <motion.div
              key={sensor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => setSelectedSensor(sensor)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon name={getTypeIcon(sensor.type)} size={24} className="text-primary-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {sensor.id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sensor.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
                <StatusIcon
                  status={sensor.status === 'active' ? 'success' : 'error'}
                  size={16}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {sensor.location}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Reading:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTimestamp(sensor.lastReading)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Value:</span>
                  <span className="text-sm font-bold text-primary-600">
                    {sensor.value?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Sensors;
