import { supabase, supabaseHelpers, TABLES } from '../lib/supabase';
import toast from 'react-hot-toast';

// Sensor Service
export const sensorService = {
  getSensors: async (params = {}) => {
    try {
      const { data, error } = await supabaseHelpers.getSensors(params);
      if (error) throw error;
      return { data: { sensors: data } };
    } catch (error) {
      console.error('Error fetching sensors:', error);
      // Return mock data as fallback
      // Generate Indian city sensors with proper coordinates
      const indianCities = [
        { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567 },
        { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
      ];

      const sensorTypes = ['traffic', 'air_quality', 'energy', 'water', 'waste'];
      const locations = [
        'Main Road Junction', 'City Center', 'Market Area', 'Residential Zone', 'Industrial Area',
        'Bus Station', 'Railway Station', 'Airport Road', 'Hospital Area', 'School Zone',
        'Shopping Mall', 'Government Office', 'Park Area', 'River Bank', 'Highway Entrance'
      ];

      return {
        data: {
          sensors: Array.from({ length: 34 }, (_, i) => {
            const city = indianCities[i % indianCities.length];
            const sensorType = sensorTypes[i % sensorTypes.length];
            const location = locations[i % locations.length];

            // Add some random offset to city coordinates
            const latOffset = (Math.random() - 0.5) * 0.05; // ~5km radius
            const lngOffset = (Math.random() - 0.5) * 0.05;

            return {
              id: `sensor_${String(i + 1).padStart(3, '0')}`,
              name: `${sensorType.replace('_', ' ').toUpperCase()} - ${location}`,
              type: sensorType,
              location: `${location}, ${city.name}`,
              city: city.name,
              latitude: city.lat + latOffset,
              longitude: city.lng + lngOffset,
              status: Math.random() > 0.1 ? 'active' : 'inactive',
              last_reading: new Date(Date.now() - Math.random() * 3600000).toISOString(),
              value: Math.random() * 100,
              created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
              metadata: {
                installation_date: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString().split('T')[0],
                last_maintenance: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString().split('T')[0]
              }
            };
          })
        }
      };
    }
  },

  getSensor: async (id) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SENSORS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching sensor:', error);
      throw error;
    }
  },

  createSensor: async (sensorData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SENSORS)
        .insert(sensorData)
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Sensor created successfully');
      return { data };
    } catch (error) {
      console.error('Error creating sensor:', error);
      toast.error('Failed to create sensor');
      throw error;
    }
  },

  updateSensor: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SENSORS)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Sensor updated successfully');
      return { data };
    } catch (error) {
      console.error('Error updating sensor:', error);
      toast.error('Failed to update sensor');
      throw error;
    }
  },

  deleteSensor: async (id) => {
    try {
      const { error } = await supabase
        .from(TABLES.SENSORS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Sensor deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting sensor:', error);
      toast.error('Failed to delete sensor');
      throw error;
    }
  },

  getSensorData: async (sensorId, limit = 100) => {
    try {
      const { data, error } = await supabaseHelpers.getSensorData(sensorId, limit);
      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      // Return mock data as fallback
      return {
        data: Array.from({ length: limit }, (_, i) => ({
          id: `data_${i}`,
          sensor_id: sensorId,
          value: 50 + 20 * Math.sin(i * 0.1) + Math.random() * 10,
          unit: 'units',
          timestamp: new Date(Date.now() - i * 60000).toISOString()
        }))
      };
    }
  }
};

// Alert Service
export const alertService = {
  getAlerts: async (params = {}) => {
    try {
      const { data, error } = await supabaseHelpers.getAlerts(params);
      if (error) throw error;
      return { data: { alerts: data } };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Return mock data as fallback
      return {
        data: {
          alerts: [
            {
              id: 'alert_1',
              title: 'High Traffic Congestion',
              message: 'Traffic congestion detected on MG Road',
              type: 'traffic',
              severity: 'high',
              status: 'open',
              sensor_id: 'sensor_001',
              location: 'MG Road Junction',
              created_at: new Date(Date.now() - 300000).toISOString()
            },
            {
              id: 'alert_2',
              title: 'Air Quality Alert',
              message: 'PM2.5 levels exceeding safe limits',
              type: 'air_quality',
              severity: 'medium',
              status: 'acknowledged',
              sensor_id: 'sensor_002',
              location: 'Cubbon Park',
              created_at: new Date(Date.now() - 600000).toISOString()
            }
          ]
        }
      };
    }
  },

  createAlert: async (alertData) => {
    try {
      const { data, error } = await supabaseHelpers.createAlert(alertData);
      if (error) throw error;
      toast.success('Alert created successfully');
      return { data };
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
      throw error;
    }
  },

  updateAlert: async (id, updates) => {
    try {
      const { data, error } = await supabaseHelpers.updateAlert(id, updates);
      if (error) throw error;
      toast.success('Alert updated successfully');
      return { data };
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
      throw error;
    }
  },

  acknowledgeAlert: async (id, notes = '') => {
    try {
      const { data, error } = await supabaseHelpers.updateAlert(id, {
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        metadata: { notes }
      });
      
      if (error) throw error;
      toast.success('Alert acknowledged');
      return { data };
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
      throw error;
    }
  },

  resolveAlert: async (id, notes = '') => {
    try {
      const { data, error } = await supabaseHelpers.updateAlert(id, {
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        metadata: { notes }
      });
      
      if (error) throw error;
      toast.success('Alert resolved');
      return { data };
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
      throw error;
    }
  }
};

// Analytics Service (keeping the existing ML service calls)
export const analyticsService = {
  getDashboardStats: () => {
    return fetch('http://localhost:5000/analytics/dashboard')
      .then(response => response.json())
      .catch(() => ({
        traffic_efficiency: {
          current: 78.5,
          predicted_peak: 85.2,
          peak_time: '18:30',
          improvement_suggestions: [
            'Optimize traffic light timing on MG Road',
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
      }));
  },

  getTrafficPredictions: (sensorId, hours = 24) => {
    return fetch('http://localhost:5000/predict/traffic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sensor_id: sensorId,
        hours: hours,
        historical_data: []
      })
    }).then(response => response.json())
    .catch(() => ({
      predictions: Array.from({ length: hours }, (_, i) => 
        50 + 20 * Math.sin(i * 0.3) + Math.random() * 10
      ),
      accuracy_score: 0.85,
      model_type: 'LSTM'
    }));
  },

  getEnergyAnalysis: (timeRange = '24h') => {
    return fetch('http://localhost:5000/predict/energy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hours: 24,
        historical_data: []
      })
    }).then(response => response.json())
    .catch(() => ({
      predictions: Array.from({ length: 24 }, (_, i) => 
        3.5 + 1.5 * Math.sin(i * 0.2) + Math.random() * 0.3
      ),
      accuracy_score: 0.78,
      model_type: 'ARIMA'
    }));
  },

  getAirQualityForecast: (sensorId, days = 7) => {
    return fetch('http://localhost:5000/predict/air-quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        days: days,
        historical_data: []
      })
    }).then(response => response.json())
    .catch(() => ({
      daily_predictions: Array.from({ length: days }, () => 
        80 + Math.random() * 20
      ),
      accuracy_score: 0.72,
      model_type: 'LSTM'
    }));
  },

  getWasteOptimization: () => {
    return fetch('http://localhost:5000/optimize/waste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bins: [] })
    }).then(response => response.json())
    .catch(() => ({
      optimized_route: [],
      total_bins: 0,
      estimated_time_saved: '0 minutes'
    }));
  }
};

// Blockchain Service (keeping the existing backend calls)
export const blockchainService = {
  getStatus: () => fetch('http://localhost:3000/api/blockchain/status').then(r => r.json()),
  getTransparencyReport: (timeRange = '24h') => 
    fetch(`http://localhost:3000/api/blockchain/transparency-report?timeRange=${timeRange}`).then(r => r.json()),
  verifyData: (dataHash, transactionId) => 
    fetch('http://localhost:3000/api/blockchain/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataHash, transactionId })
    }).then(r => r.json()),
  logAdminAction: (action, details) => 
    fetch('http://localhost:3000/api/blockchain/log-admin-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details })
    }).then(r => r.json()),
  getAnalytics: (timeRange = '7d') => 
    fetch(`http://localhost:3000/api/blockchain/analytics?timeRange=${timeRange}`).then(r => r.json()),
  getTransactionDetails: (transactionId) => 
    fetch(`http://localhost:3000/api/blockchain/explorer/${transactionId}`).then(r => r.json())
};

// Real-time subscriptions
export const subscriptionService = {
  subscribeToSensorData: (callback) => {
    return supabaseHelpers.subscribeToTable(TABLES.SENSOR_DATA, callback);
  },

  subscribeToAlerts: (callback) => {
    return supabaseHelpers.subscribeToTable(TABLES.ALERTS, callback);
  },

  subscribeToSensors: (callback) => {
    return supabaseHelpers.subscribeToTable(TABLES.SENSORS, callback);
  },

  unsubscribe: (subscription) => {
    supabaseHelpers.unsubscribe(subscription);
  }
};

const supabaseApiServices = {
  sensorService,
  alertService,
  analyticsService,
  blockchainService,
  subscriptionService
};

export default supabaseApiServices;
