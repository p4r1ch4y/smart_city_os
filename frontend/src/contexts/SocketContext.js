import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase, TABLES } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeData, setRealtimeData] = useState({
    sensors: {},
    alerts: [],
    stats: {}
  });
  const { isAuthenticated, user } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (isAuthenticated && user) {
      setupSupabaseSubscriptions();
    } else {
      cleanupSubscriptions();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [isAuthenticated, user]);

  const setupSupabaseSubscriptions = () => {
    if (subscriptions.length > 0) return;

    console.log('Setting up Supabase real-time subscriptions...');

    try {
      // Subscribe to sensor data changes
      const sensorDataSubscription = supabase
        .channel('sensor_data_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TABLES.SENSOR_DATA
          },
          (payload) => {
            console.log('Sensor data change:', payload);
            handleSensorDataChange(payload);
          }
        )
        .subscribe();

      // Subscribe to alerts changes
      const alertsSubscription = supabase
        .channel('alerts_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TABLES.ALERTS
          },
          (payload) => {
            console.log('Alert change:', payload);
            handleAlertChange(payload);
          }
        )
        .subscribe();

      // Subscribe to sensors changes
      const sensorsSubscription = supabase
        .channel('sensors_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TABLES.SENSORS
          },
          (payload) => {
            console.log('Sensor change:', payload);
            handleSensorChange(payload);
          }
        )
        .subscribe();

      setSubscriptions([sensorDataSubscription, alertsSubscription, sensorsSubscription]);
      setIsConnected(true);
      toast.success('Real-time connection established');

    } catch (error) {
      console.error('Error setting up Supabase subscriptions:', error);
      toast.error('Failed to establish real-time connection');
    }
  };

  const handleSensorDataChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      setRealtimeData(prev => ({
        ...prev,
        sensors: {
          ...prev.sensors,
          [newRecord.sensor_id]: {
            ...prev.sensors[newRecord.sensor_id],
            lastReading: newRecord.timestamp,
            value: newRecord.value,
            unit: newRecord.unit
          }
        }
      }));
    }
  };

  const handleAlertChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      setRealtimeData(prev => ({
        ...prev,
        alerts: [newRecord, ...prev.alerts.slice(0, 49)] // Keep last 50 alerts
      }));

      // Show toast for new alerts
      if (newRecord.severity === 'critical') {
        toast.error(`Critical Alert: ${newRecord.title}`);
      } else if (newRecord.severity === 'high') {
        toast.error(`High Priority Alert: ${newRecord.title}`);
      }
    } else if (eventType === 'UPDATE') {
      setRealtimeData(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert =>
          alert.id === newRecord.id ? newRecord : alert
        )
      }));
    } else if (eventType === 'DELETE') {
      setRealtimeData(prev => ({
        ...prev,
        alerts: prev.alerts.filter(alert => alert.id !== oldRecord.id)
      }));
    }
  };

  const handleSensorChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'UPDATE') {
      // Update sensor status or metadata
      setRealtimeData(prev => ({
        ...prev,
        sensors: {
          ...prev.sensors,
          [newRecord.id]: {
            ...prev.sensors[newRecord.id],
            status: newRecord.status,
            metadata: newRecord.metadata
          }
        }
      }));
    }
  };

  const cleanupSubscriptions = () => {
    console.log('Cleaning up Supabase subscriptions...');
    subscriptions.forEach(subscription => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    });
    setSubscriptions([]);
    setIsConnected(false);
  };

  // Helper functions for getting real-time data
  const getActiveAlerts = () => {
    return realtimeData.alerts.filter(alert =>
      alert.status === 'open' || alert.status === 'acknowledged'
    );
  };

  const getSensorData = (sensorId) => {
    return realtimeData.sensors[sensorId] || null;
  };

  const getAllSensorsData = () => {
    return realtimeData.sensors;
  };

  // Simulate real-time data for demo purposes when Supabase is not available
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      const interval = setInterval(() => {
        // Generate mock sensor data
        const mockSensorData = {
          sensor_001: {
            value: 50 + 20 * Math.sin(Date.now() / 10000) + Math.random() * 10,
            unit: 'vehicles/min',
            timestamp: new Date().toISOString(),
            status: 'active'
          },
          sensor_002: {
            value: 80 + 15 * Math.sin(Date.now() / 15000) + Math.random() * 8,
            unit: 'AQI',
            timestamp: new Date().toISOString(),
            status: 'active'
          },
          sensor_003: {
            value: 3.5 + 1.5 * Math.sin(Date.now() / 20000) + Math.random() * 0.5,
            unit: 'kWh',
            timestamp: new Date().toISOString(),
            status: 'active'
          }
        };

        setRealtimeData(prev => ({
          ...prev,
          sensors: {
            ...prev.sensors,
            ...mockSensorData
          },
          stats: {
            totalSensors: 34,
            activeSensors: 32,
            alerts: prev.alerts.length,
            lastUpdate: new Date().toISOString()
          }
        }));
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected, isAuthenticated]);
  const value = {
    isConnected,
    realtimeData,
    getActiveAlerts,
    getSensorData,
    getAllSensorsData,
    // Legacy compatibility
    socket: null,
    emit: () => console.warn('Socket.io emit not available with Supabase'),
    on: () => console.warn('Socket.io on not available with Supabase'),
    off: () => console.warn('Socket.io off not available with Supabase')
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
