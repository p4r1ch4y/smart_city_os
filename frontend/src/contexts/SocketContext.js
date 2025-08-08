import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
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
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  const connectSocket = () => {
    if (socket?.connected) return;

    const newSocket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Join user-specific room
      if (user?.role) {
        newSocket.emit('join-room', `role-${user.role}`);
        newSocket.emit('join-room', `user-${user.id}`);
      }
      
      toast.success('Real-time connection established');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          if (!newSocket.connected) {
            newSocket.connect();
          }
        }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
      } else {
        toast.error('Lost connection to server');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Real-time data handlers
    newSocket.on('sensor-data', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        sensors: {
          ...prev.sensors,
          [data.sensorId]: {
            ...data,
            timestamp: new Date(data.data.timestamp || Date.now())
          }
        }
      }));

      // Show alert notifications if any
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach(alert => {
          if (alert.severity === 'critical') {
            toast.error(`Critical Alert: ${alert.condition} for ${data.sensorId}`);
          } else if (alert.severity === 'warning') {
            toast.error(`Warning: ${alert.condition} for ${data.sensorId}`);
          }
        });
      }
    });

    newSocket.on('alert-created', (alert) => {
      setRealtimeData(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts.slice(0, 99)] // Keep last 100 alerts
      }));

      // Show notification based on severity
      const message = `${alert.title} - ${alert.sensor?.name || 'Unknown sensor'}`;
      
      if (alert.severity === 'critical') {
        toast.error(message, { duration: 6000 });
      } else if (alert.severity === 'high') {
        toast.error(message, { duration: 4000 });
      } else if (alert.severity === 'medium') {
        toast(message, { 
          icon: '⚠️',
          duration: 3000 
        });
      }
    });

    newSocket.on('alert-acknowledged', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === data.alertId 
            ? { ...alert, status: 'acknowledged', acknowledgedBy: data.acknowledgedBy }
            : alert
        )
      }));
      
      toast.success(`Alert acknowledged by ${data.acknowledgedBy}`);
    });

    newSocket.on('alert-resolved', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === data.alertId 
            ? { ...alert, status: 'resolved', resolvedBy: data.resolvedBy }
            : alert
        )
      }));
      
      toast.success(`Alert resolved by ${data.resolvedBy}`);
    });

    newSocket.on('alert-dismissed', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        alerts: prev.alerts.filter(alert => alert.id !== data.alertId)
      }));
      
      toast.success(`Alert dismissed by ${data.dismissedBy}`);
    });

    newSocket.on('stats-update', (stats) => {
      setRealtimeData(prev => ({
        ...prev,
        stats: { ...prev.stats, ...stats }
      }));
    });

    newSocket.on('sensor-status-change', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        sensors: {
          ...prev.sensors,
          [data.sensorId]: {
            ...prev.sensors[data.sensorId],
            status: data.status,
            lastHeartbeat: data.lastHeartbeat
          }
        }
      }));

      if (data.status === 'offline') {
        toast.error(`Sensor ${data.sensorId} went offline`);
      } else if (data.status === 'active' && prev.sensors[data.sensorId]?.status === 'offline') {
        toast.success(`Sensor ${data.sensorId} is back online`);
      }
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const joinRoom = (room) => {
    emitEvent('join-room', room);
  };

  const leaveRoom = (room) => {
    emitEvent('leave-room', room);
  };

  // Get latest sensor data
  const getSensorData = (sensorId) => {
    return realtimeData.sensors[sensorId] || null;
  };

  // Get active alerts
  const getActiveAlerts = () => {
    return realtimeData.alerts.filter(alert => alert.status === 'active');
  };

  // Get alerts by severity
  const getAlertsBySeverity = (severity) => {
    return realtimeData.alerts.filter(alert => 
      alert.severity === severity && alert.status === 'active'
    );
  };

  const value = {
    socket,
    isConnected,
    realtimeData,
    emitEvent,
    joinRoom,
    leaveRoom,
    getSensorData,
    getActiveAlerts,
    getAlertsBySeverity,
    connectSocket,
    disconnectSocket
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
