import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import CityVisualization3D from '../components/CityVisualization3D';
import { useAuth } from '../contexts/AuthContext';
import { useSensorData } from '../hooks/useSensorData';
import { Box, Activity, Zap, Wind } from 'lucide-react';

function CityTwin() {
  const { user } = useAuth();
  const { sensorData, loading } = useSensorData();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [viewMode, setViewMode] = useState('3d');

  // Transform sensor data for 3D visualization
  const transform3DSensorData = () => {
    if (!sensorData || sensorData.length === 0) return [];
    
    return sensorData.map(sensor => ({
      id: sensor.id,
      type: sensor.type,
      value: sensor.value,
      unit: sensor.unit,
      status: sensor.value > 80 ? 'critical' : sensor.value > 60 ? 'warning' : 'normal',
      location: sensor.location,
      timestamp: sensor.timestamp
    }));
  };

  const handleSensorClick = (sensorData) => {
    setSelectedSensor(sensorData);
    console.log('Sensor clicked:', sensorData);
  };

  const handleBuildingClick = (buildingData) => {
    setSelectedBuilding(buildingData);
    console.log('Building clicked:', buildingData);
  };

  const getSensorStats = () => {
    const sensors = transform3DSensorData();
    const total = sensors.length;
    const critical = sensors.filter(s => s.status === 'critical').length;
    const warning = sensors.filter(s => s.status === 'warning').length;
    const normal = sensors.filter(s => s.status === 'normal').length;

    return { total, critical, warning, normal };
  };

  const stats = getSensorStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Box className="mr-3 h-8 w-8 text-blue-400" />
                Digital City Twin
              </h1>
              <p className="text-gray-300 mt-1">
                Interactive 3D visualization of smart city infrastructure
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === '3d' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  3D View
                </button>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'stats' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Statistics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">{stats.total}</span>
              <span className="text-gray-300 text-sm">Total Sensors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-white font-medium">{stats.critical}</span>
              <span className="text-gray-300 text-sm">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-white font-medium">{stats.warning}</span>
              <span className="text-gray-300 text-sm">Warning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white font-medium">{stats.normal}</span>
              <span className="text-gray-300 text-sm">Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {viewMode === '3d' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[calc(100vh-200px)]"
          >
            <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
              <div className="text-center text-white">
                <Box className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                <h3 className="text-xl font-semibold mb-2">3D City Visualization</h3>
                <p className="text-gray-400 mb-4">Interactive 3D model coming soon</p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {transform3DSensorData().slice(0, 4).map((sensor, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-400">{sensor.type}</div>
                      <div className="text-lg font-bold">{sensor.value}</div>
                      <div className="text-xs text-gray-500">{sensor.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sensor Type Distribution */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Wind className="mr-2 h-5 w-5 text-blue-400" />
                  Air Quality Sensors
                </h3>
                <div className="space-y-3">
                  {transform3DSensorData()
                    .filter(s => s.type === 'air_quality')
                    .map(sensor => (
                      <div key={sensor.id} className="flex items-center justify-between">
                        <span className="text-gray-300">{sensor.location || `Sensor ${sensor.id}`}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{sensor.value}</span>
                          <div className={`w-3 h-3 rounded-full ${
                            sensor.status === 'critical' ? 'bg-red-500' :
                            sensor.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Traffic Sensors */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-green-400" />
                  Traffic Sensors
                </h3>
                <div className="space-y-3">
                  {transform3DSensorData()
                    .filter(s => s.type === 'traffic')
                    .map(sensor => (
                      <div key={sensor.id} className="flex items-center justify-between">
                        <span className="text-gray-300">{sensor.location || `Sensor ${sensor.id}`}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{sensor.value}%</span>
                          <div className={`w-3 h-3 rounded-full ${
                            sensor.status === 'critical' ? 'bg-red-500' :
                            sensor.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Energy Sensors */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                  Energy Sensors
                </h3>
                <div className="space-y-3">
                  {transform3DSensorData()
                    .filter(s => s.type === 'energy')
                    .map(sensor => (
                      <div key={sensor.id} className="flex items-center justify-between">
                        <span className="text-gray-300">{sensor.location || `Sensor ${sensor.id}`}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{sensor.value} kW</span>
                          <div className={`w-3 h-3 rounded-full ${
                            sensor.status === 'critical' ? 'bg-red-500' :
                            sensor.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Selected Object Details */}
            {(selectedSensor || selectedBuilding) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedSensor ? 'Sensor Details' : 'Building Details'}
                </h3>
                {selectedSensor && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Type</p>
                      <p className="text-white font-medium">{selectedSensor.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Value</p>
                      <p className="text-white font-medium">{selectedSensor.value} {selectedSensor.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <p className={`font-medium ${
                        selectedSensor.status === 'critical' ? 'text-red-400' :
                        selectedSensor.status === 'warning' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {selectedSensor.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">{selectedSensor.location || 'Unknown'}</p>
                    </div>
                  </div>
                )}
                {selectedBuilding && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white font-medium">{selectedBuilding.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Type</p>
                      <p className="text-white font-medium">{selectedBuilding.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Height</p>
                      <p className="text-white font-medium">{selectedBuilding.height}m</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <p className="text-green-400 font-medium">Active</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="text-white">Loading city data...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CityTwin;
