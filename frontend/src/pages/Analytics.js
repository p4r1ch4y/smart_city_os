import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { analyticsService } from '../services/api';
import { Icon, StatusIcon } from '../components/icons';
import RealtimeChart from '../components/RealtimeChart';
import LoadingSpinner from '../components/LoadingSpinner';

function Analytics() {
  const [selectedMetric, setSelectedMetric] = useState('traffic');
  const [timeRange, setTimeRange] = useState('24h');
  const [predictions, setPredictions] = useState(null);

  // Fetch dashboard analytics
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard-analytics',
    () => analyticsService.getDashboardStats(),
    {
      refetchInterval: 30000,
      onError: () => {
        // Fallback data if analytics service is not available
        return {
          traffic_efficiency: {
            current: 78.5,
            predicted_peak: 85.2,
            peak_time: '18:30',
            improvement_suggestions: [
              'Optimize traffic light timing on Main St',
              'Consider alternate routes during peak hours'
            ]
          },
          energy_optimization: {
            current_consumption: 3.8,
            predicted_savings: 12.5,
            renewable_percentage: 34.2,
            recommendations: [
              'Increase solar panel efficiency',
              'Implement smart grid load balancing'
            ]
          }
        };
      }
    }
  );

  // Fetch predictions based on selected metric
  const fetchPredictions = async (metric) => {
    try {
      let response;
      switch (metric) {
        case 'traffic':
          response = await analyticsService.getTrafficPredictions('sensor_001', 24);
          break;
        case 'energy':
          response = await analyticsService.getEnergyAnalysis('24h');
          break;
        case 'air-quality':
          response = await analyticsService.getAirQualityForecast('aqi_001', 7);
          break;
        default:
          response = { data: { predictions: [] } };
      }
      setPredictions(response.data);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      // Generate dummy predictions for demo
      const dummyPredictions = Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() + i * 3600000).toISOString(),
        value: 50 + 20 * Math.sin(i * 0.3) + Math.random() * 10
      }));
      setPredictions({ predictions: dummyPredictions.map(p => p.value) });
    }
  };

  useEffect(() => {
    fetchPredictions(selectedMetric);
  }, [selectedMetric]);

  const metrics = [
    { id: 'traffic', name: 'Traffic Flow', icon: 'traffic', color: '#FF6B35' },
    { id: 'energy', name: 'Energy Consumption', icon: 'energy', color: '#00CED1' },
    { id: 'air-quality', name: 'Air Quality', icon: 'airQuality', color: '#FFD700' },
  ];

  if (dashboardLoading) {
    return <LoadingSpinner />;
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
            Predictive Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered insights and forecasting for smart city operations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIcon status="success" size={16} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Models Updated
          </span>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Metric for Prediction
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedMetric === metric.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon name={metric.icon} size={24} color={metric.color} />
                <span className="font-medium text-gray-900 dark:text-white">
                  {metric.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            24-Hour Forecast
          </h2>
          <div className="flex items-center space-x-2">
            <Icon name="trendingUp" size={16} className="text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Accuracy: 85%
            </span>
          </div>
        </div>

        {predictions ? (
          <div className="h-80">
            <RealtimeChart
              data={predictions.predictions?.map((value, index) => ({
                timestamp: new Date(Date.now() + index * 3600000).toISOString(),
                value: value
              })) || []}
              dataKey="value"
              color={metrics.find(m => m.id === selectedMetric)?.color || '#00CED1'}
              height={320}
              showPrediction={true}
            />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Analytics Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Efficiency */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="traffic" size={24} className="text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Traffic Efficiency
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Current Efficiency</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.traffic_efficiency?.current || 78.5}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Predicted Peak</span>
              <span className="text-lg font-semibold text-orange-500">
                {dashboardData?.traffic_efficiency?.predicted_peak || 85.2}%
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Recommendations
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {(dashboardData?.traffic_efficiency?.improvement_suggestions || [
                  'Optimize traffic light timing',
                  'Consider alternate routes'
                ]).map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon name="chevronRight" size={12} className="mt-1 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Energy Optimization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="energy" size={24} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Energy Optimization
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Current Usage</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.energy_optimization?.current_consumption || 3.8} MW
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Potential Savings</span>
              <span className="text-lg font-semibold text-green-500">
                {dashboardData?.energy_optimization?.predicted_savings || 12.5}%
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Recommendations
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {(dashboardData?.energy_optimization?.recommendations || [
                  'Increase solar panel efficiency',
                  'Implement smart grid balancing'
                ]).map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon name="chevronRight" size={12} className="mt-1 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Analytics;
