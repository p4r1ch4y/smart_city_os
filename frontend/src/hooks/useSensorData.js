import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

/**
 * Custom hook for managing sensor data
 * Provides real-time sensor data with loading states
 */
export function useSensorData() {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isConnected, realtimeData } = useSocket();

  useEffect(() => {
    // Generate mock sensor data if no real data is available
    const generateMockSensorData = () => {
      const sensorTypes = ['air_quality', 'traffic', 'energy', 'water', 'waste'];
      const locations = ['Downtown', 'North District', 'South District', 'East Side', 'West Side'];
      
      return sensorTypes.map((type, index) => ({
        id: `sensor_${type}_${index}`,
        type: type,
        location: locations[index % locations.length],
        value: Math.floor(Math.random() * 100),
        unit: getUnitForType(type),
        status: getRandomStatus(),
        timestamp: new Date().toISOString(),
        metadata: generateMetadataForType(type)
      }));
    };

    const getUnitForType = (type) => {
      switch (type) {
        case 'air_quality': return 'AQI';
        case 'traffic': return '%';
        case 'energy': return 'kW';
        case 'water': return '%';
        case 'waste': return '%';
        default: return '';
      }
    };

    const getRandomStatus = () => {
      const statuses = ['normal', 'warning', 'critical'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const generateMetadataForType = (type) => {
      switch (type) {
        case 'air_quality':
          const aqi = Math.floor(Math.random() * 200);
          return {
            aqi: aqi,
            pm25: Math.floor(Math.random() * 50),
            pm10: Math.floor(Math.random() * 100),
            co2: 300 + Math.floor(Math.random() * 200),
            humidity: 40 + Math.floor(Math.random() * 40),
            temperature: 15 + Math.floor(Math.random() * 20)
          };
        case 'traffic':
          return {
            congestion_level: Math.floor(Math.random() * 100),
            average_speed: 20 + Math.floor(Math.random() * 40),
            vehicle_count: Math.floor(Math.random() * 500)
          };
        case 'energy':
          return {
            consumption: Math.floor(Math.random() * 1000),
            peak_demand: Math.floor(Math.random() * 1200),
            efficiency: 70 + Math.floor(Math.random() * 30)
          };
        default:
          return {};
      }
    };

    // Initialize with mock data
    setLoading(true);
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        // Use real-time data if available, otherwise use mock data
        if (realtimeData && realtimeData.sensors && Object.keys(realtimeData.sensors).length > 0) {
          const realSensorData = Object.entries(realtimeData.sensors).map(([id, data]) => ({
            id,
            type: data.type || 'unknown',
            location: data.location || 'Unknown',
            value: data.value || 0,
            unit: getUnitForType(data.type || 'unknown'),
            status: data.value > 80 ? 'critical' : data.value > 60 ? 'warning' : 'normal',
            timestamp: data.timestamp || new Date().toISOString(),
            metadata: data.metadata || {}
          }));
          setSensorData(realSensorData);
        } else {
          setSensorData(generateMockSensorData());
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        setSensorData(generateMockSensorData()); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [realtimeData, isConnected]);

  // Update sensor data when real-time data changes
  useEffect(() => {
    if (realtimeData && realtimeData.sensors && Object.keys(realtimeData.sensors).length > 0) {
      const updatedSensorData = Object.entries(realtimeData.sensors).map(([id, data]) => ({
        id,
        type: data.type || 'unknown',
        location: data.location || 'Unknown',
        value: data.value || 0,
        unit: data.type === 'air_quality' ? 'AQI' : 
              data.type === 'traffic' ? '%' :
              data.type === 'energy' ? 'kW' : '',
        status: data.value > 80 ? 'critical' : data.value > 60 ? 'warning' : 'normal',
        timestamp: data.timestamp || new Date().toISOString(),
        metadata: data.metadata || {}
      }));
      setSensorData(updatedSensorData);
    }
  }, [realtimeData]);

  return {
    sensorData,
    loading,
    error,
    isConnected
  };
}

export default useSensorData;
