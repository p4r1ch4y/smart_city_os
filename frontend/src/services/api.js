import axios from 'axios';
import toast from 'react-hot-toast';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instances
export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
        if (tokens?.refreshToken) {
          const response = await authAPI.post('/auth/refresh', {
            refreshToken: tokens.refreshToken
          });

          const newTokens = response.data.tokens;
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          api.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('tokens');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authService = {
  login: (credentials) => authAPI.post('/auth/login', credentials),
  register: (userData) => authAPI.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => authAPI.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (updates) => api.put('/auth/profile', updates),
};

// Sensor API methods
export const sensorService = {
  // Get all sensors
  getSensors: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/sensors?${queryParams.toString()}`);
  },

  // Get sensor by ID
  getSensor: (id) => api.get(`/sensors/${id}`),

  // Create new sensor
  createSensor: (sensorData) => api.post('/sensors', sensorData),

  // Update sensor
  updateSensor: (id, updates) => api.put(`/sensors/${id}`, updates),

  // Delete sensor
  deleteSensor: (id) => api.delete(`/sensors/${id}`),

  // Submit sensor data
  submitSensorData: (data) => api.post('/sensors/data', data),

  // Get sensor data history
  getSensorData: (sensorId, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('sensorId', sensorId);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/sensors/data?${queryParams.toString()}`);
  },

  // Get aggregated sensor data
  getAggregatedData: (sensorId, interval = 'hour', startTime, endTime) => {
    const params = { sensorId, interval };
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    
    const queryParams = new URLSearchParams(params);
    return api.get(`/sensors/aggregated?${queryParams.toString()}`);
  }
};

// Alert API methods
export const alertService = {
  // Get all alerts
  getAlerts: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return api.get(`/alerts?${queryParams.toString()}`);
  },

  // Get alert by ID
  getAlert: (id) => api.get(`/alerts/${id}`),

  // Get alert statistics
  getAlertStats: (timeRange = '24h') => api.get(`/alerts/stats?timeRange=${timeRange}`),

  // Acknowledge alert
  acknowledgeAlert: (id, notes) => api.post(`/alerts/${id}/acknowledge`, { notes }),

  // Resolve alert
  resolveAlert: (id, notes) => api.post(`/alerts/${id}/resolve`, { notes }),

  // Dismiss alert
  dismissAlert: (id, notes) => api.post(`/alerts/${id}/dismiss`, { notes }),
};

// Analytics API methods (placeholder for future implementation)
export const analyticsService = {
  // Get dashboard statistics
  getDashboardStats: () => api.get('/analytics/dashboard'),

  // Get traffic predictions
  getTrafficPredictions: (sensorId, hours = 24) => 
    api.get(`/analytics/traffic/predictions?sensorId=${sensorId}&hours=${hours}`),

  // Get air quality forecast
  getAirQualityForecast: (sensorId, days = 7) => 
    api.get(`/analytics/air-quality/forecast?sensorId=${sensorId}&days=${days}`),

  // Get waste collection optimization
  getWasteOptimization: () => api.get('/analytics/waste/optimization'),

  // Get energy consumption analysis
  getEnergyAnalysis: (timeRange = '7d') => 
    api.get(`/analytics/energy/analysis?timeRange=${timeRange}`),
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error, defaultMessage = 'An error occurred') => {
    const message = error.response?.data?.message || error.message || defaultMessage;
    console.error('API Error:', error);
    return message;
  },

  // Format API response data
  formatResponse: (response) => {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  },

  // Create query string from object
  createQueryString: (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    return queryParams.toString();
  },

  // Check if response is successful
  isSuccess: (response) => {
    return response.status >= 200 && response.status < 300;
  },
};

export default api;
