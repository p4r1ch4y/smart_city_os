import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useQuery } from 'react-query';
import { sensorService, alertService } from '../services/api';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  SignalIcon,
  MapPinIcon,
  ClockIcon,
  WifiIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import {
  DashboardContainer,
  StatsGrid,
  MainContentGrid,
  MetricCard,
  DashboardCard,
  ChartContainer,
  AlertBanner
} from '../components/DashboardGrid';
import SensorMap from '../components/SensorMap';
import RealtimeChart from '../components/RealtimeChart';
import AlertsList from '../components/AlertsList';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCity } from '../contexts/CityContext';
import { useAuth } from '../contexts/AuthContext';
import { generateCitySensors, generateRealtimePattern } from '../utils/dummyCityData';

function Dashboard() {
  const { realtimeData, isConnected, getActiveAlerts } = useSocket();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Fetch initial data
  const { cityKey } = useCity();

  const { data: sensorsData, isLoading: sensorsLoading } = useQuery(
    ['sensors', cityKey],
    async () => {
      try {
        return await sensorService.getSensors({ limit: 100, city: cityKey });
      } catch (e) {
        // Fallback to rich dummy sensors if API fails
        return { data: { sensors: generateCitySensors(cityKey) } };
      }
    },
    {
      refetchInterval: 30000,
    }
  );

  const { data: alertsData, isLoading: alertsLoading } = useQuery(
    ['alerts', selectedTimeRange],
    () => alertService.getAlertStats(selectedTimeRange),
    {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  const sensors = sensorsData?.data?.sensors || [];
  const alertStats = alertsData?.data || {};

  // If realtime data is sparse, synthesize smooth patterns for demo wow factor
  useEffect(() => {
    if (!sensors.length) return;
    const interval = setInterval(() => {
      sensors.forEach((s) => {
        const synthetic = generateRealtimePattern(s);
        // no-op: SocketContext handles real data; this improves charts if idle
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [sensors]);
  const activeAlerts = getActiveAlerts();

  // Calculate statistics
  const stats = {
    totalSensors: sensors.length,
    activeSensors: sensors.filter(s => s.status === 'active').length,
    offlineSensors: sensors.filter(s => s.status === 'offline').length,
    maintenanceSensors: sensors.filter(s => s.status === 'maintenance').length,
    totalAlerts: activeAlerts.length,
    criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
    highAlerts: activeAlerts.filter(a => a.severity === 'high').length,
    mediumAlerts: activeAlerts.filter(a => a.severity === 'medium').length,
  };

  // Sensor type distribution
  const sensorTypes = sensors.reduce((acc, sensor) => {
    acc[sensor.type] = (acc[sensor.type] || 0) + 1;
    return acc;
  }, {});

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
    visible: { opacity: 1, y: 0 }
  };

  if (sensorsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <DashboardContainer className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
            Smart City Dashboard
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Real-time monitoring and analytics
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          {/* Connection status */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap ${
            isConnected 
              ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
              : 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-danger-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {/* Time range selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="input text-xs sm:text-sm min-w-0 flex-shrink-0"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsGrid>
        <MetricCard
          title="Total Sensors"
          value={stats.totalSensors}
          icon={CpuChipIcon}
          color="blue"
          trend={stats.activeSensors > stats.offlineSensors ? 'up' : 'down'}
          trendValue={`${stats.activeSensors} active`}
        />

        <MetricCard
          title="Active Alerts"
          value={stats.totalAlerts}
          icon={ExclamationTriangleIcon}
          color={stats.criticalAlerts > 0 ? "red" : "green"}
          trend={stats.criticalAlerts > 0 ? 'down' : 'up'}
          trendValue={`${stats.criticalAlerts} critical`}
        />

        <MetricCard
          title="System Health"
          value={`${Math.round((stats.activeSensors / stats.totalSensors) * 100)}%`}
          icon={SignalIcon}
          color="green"
          trend="up"
          trendValue="Operational"
        />

        <MetricCard
          title="Data Points"
          value={Object.keys(realtimeData.sensors).length}
          icon={ChartBarIcon}
          color="purple"
          trend="up"
          trendValue="Real-time"
        />
      </StatsGrid>

      {/* Main Content Grid */}
      <MainContentGrid>
        {/* Sensor Map */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="Sensor Locations"
            subtitle={`${sensors.length} sensors monitoring city infrastructure`}
            height="h-96"
            headerAction={
              <div className="flex items-center space-x-2">
                <WifiIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.activeSensors} online
                </span>
              </div>
            }
          >
            <SensorMap sensors={sensors} realtimeData={realtimeData.sensors} />
          </ChartContainer>
        </div>

        {/* Active Alerts */}
        <div>
          <div className="card h-full">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                    Active Alerts
                  </h3>
                </div>
                <span className="badge badge-warning text-xs">
                  {activeAlerts.length}
                </span>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                <AlertsList alerts={activeAlerts.slice(0, 10)} compact />
              </div>
            </div>
          </div>
        </div>
      </MainContentGrid>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Real-time Data Chart */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                    Real-time Metrics
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Live</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="h-64 sm:h-80">
                <RealtimeChart data={realtimeData.sensors} />
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Types Distribution */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                Sensor Distribution
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(sensorTypes).map(([type, count]) => {
                  const percentage = (count / stats.totalSensors) * 100;
                  const colors = {
                    traffic: 'bg-blue-500',
                    waste: 'bg-green-500',
                    air_quality: 'bg-purple-500',
                    noise: 'bg-yellow-500',
                    water_quality: 'bg-cyan-500',
                    energy: 'bg-orange-500',
                    parking: 'bg-pink-500'
                  };
                  
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colors[type] || 'bg-gray-500'}`} />
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white capitalize truncate">
                          {type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {count}
                        </span>
                        <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${colors[type] || 'bg-gray-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(realtimeData.sensors)
                .slice(0, 5)
                .map(([sensorId, data]) => (
                  <div key={sensorId} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-2 h-2 bg-success-500 rounded-full flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {sensorId}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Data received
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Now'}
                    </span>
                  </div>
                ))}
              
              {Object.keys(realtimeData.sensors).length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                  <CpuChipIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No recent sensor activity</p>
                  <p className="text-xs sm:text-sm mt-1">Start the IoT simulation to see real-time data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
}

export default Dashboard;
