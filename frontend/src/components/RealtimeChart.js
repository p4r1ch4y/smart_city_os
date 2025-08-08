import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';

function RealtimeChart({ data = {}, maxDataPoints = 20 }) {
  const [chartData, setChartData] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState(['traffic', 'air_quality', 'energy']);

  // Process realtime data into chart format
  useEffect(() => {
    const now = new Date();
    const newDataPoint = {
      timestamp: now.toLocaleTimeString(),
      time: now.getTime(),
    };

    // Extract metrics from different sensor types
    Object.entries(data).forEach(([sensorId, sensorData]) => {
      if (!sensorData?.data) return;

      const sensorType = sensorId.split('_')[0];
      const sensorData_data = sensorData.data;

      switch (sensorType) {
        case 'traffic':
          if (selectedMetrics.includes('traffic')) {
            newDataPoint.traffic = sensorData_data.congestion_level || 0;
          }
          break;
        case 'air':
          if (selectedMetrics.includes('air_quality')) {
            newDataPoint.air_quality = sensorData_data.aqi || sensorData_data.pm25 || 0;
          }
          break;
        case 'energy':
          if (selectedMetrics.includes('energy')) {
            newDataPoint.energy = sensorData_data.consumption || 0;
          }
          break;
        case 'waste':
          if (selectedMetrics.includes('waste')) {
            newDataPoint.waste = sensorData_data.fill_percentage || 0;
          }
          break;
        case 'noise':
          if (selectedMetrics.includes('noise')) {
            newDataPoint.noise = sensorData_data.decibel_level || 0;
          }
          break;
        case 'parking':
          if (selectedMetrics.includes('parking')) {
            newDataPoint.parking = sensorData_data.occupancy_rate || 0;
          }
          break;
      }
    });

    // Only add data point if we have at least one metric
    const hasData = Object.keys(newDataPoint).some(key => 
      key !== 'timestamp' && key !== 'time' && newDataPoint[key] !== undefined
    );

    if (hasData) {
      setChartData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-maxDataPoints); // Keep only last N points
      });
    }
  }, [data, selectedMetrics, maxDataPoints]);

  // Chart configuration
  const metrics = [
    { key: 'traffic', name: 'Traffic Congestion', color: '#3b82f6', unit: '%' },
    { key: 'air_quality', name: 'Air Quality Index', color: '#8b5cf6', unit: 'AQI' },
    { key: 'energy', name: 'Energy Consumption', color: '#f97316', unit: 'kW' },
    { key: 'waste', name: 'Waste Fill Level', color: '#22c55e', unit: '%' },
    { key: 'noise', name: 'Noise Level', color: '#eab308', unit: 'dB' },
    { key: 'parking', name: 'Parking Occupancy', color: '#ec4899', unit: '%' },
  ];

  const activeMetrics = metrics.filter(metric => selectedMetrics.includes(metric.key));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}: {entry.value?.toFixed(1)} {
                  metrics.find(m => m.key === entry.dataKey)?.unit || ''
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generate some sample data if no real data
  const sampleData = useMemo(() => {
    if (chartData.length > 0) return chartData;
    
    return Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - (9 - i) * 30000).toLocaleTimeString(),
      traffic: Math.random() * 100,
      air_quality: Math.random() * 200,
      energy: Math.random() * 50,
      waste: Math.random() * 100,
      noise: 40 + Math.random() * 40,
      parking: Math.random() * 100,
    }));
  }, [chartData]);

  const displayData = chartData.length > 0 ? chartData : sampleData;

  return (
    <div className="space-y-4">
      {/* Metric selector */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <motion.button
            key={metric.key}
            onClick={() => {
              setSelectedMetrics(prev => 
                prev.includes(metric.key)
                  ? prev.filter(m => m !== metric.key)
                  : [...prev, metric.key]
              );
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedMetrics.includes(metric.key)
                ? 'text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={{
              backgroundColor: selectedMetrics.includes(metric.key) ? metric.color : undefined
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedMetrics.includes(metric.key) ? 'white' : metric.color }}
              />
              <span>{metric.name}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        {activeMetrics.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {activeMetrics.map((metric, index) => (
                <Area
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.name}
                  stroke={metric.color}
                  fill={metric.color}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ fill: metric.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: metric.color, strokeWidth: 2 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 opacity-50">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm">Select metrics to display</p>
            </div>
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          <span>Live data • Updates every 5 seconds</span>
        </div>
        <span>{displayData.length} data points</span>
      </div>
    </div>
  );
}

export default RealtimeChart;
