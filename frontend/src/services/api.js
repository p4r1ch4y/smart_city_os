import axios from 'axios';
import toast from 'react-hot-toast';
import {
  sensorService as supabaseSensorService,
  alertService as supabaseAlertService,
  analyticsService as supabaseAnalyticsService,
  blockchainService as supabaseBlockchainService
} from './supabaseApi';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const USE_STACK_AUTH = (process.env.REACT_APP_USE_STACK_AUTH || process.env.USE_STACK_AUTH) === 'true';

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
        if (USE_STACK_AUTH) {
          // With Stack Auth, no backend refresh endpoint; redirect to login
          localStorage.removeItem('tokens');
          window.location.href = '/login';
          return Promise.reject(error);
        }
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

// Sensor API methods - now using Supabase
export const sensorService = supabaseSensorService;

// Alert API methods - now using Supabase
export const alertService = supabaseAlertService;

// Analytics API methods - now using Supabase
export const analyticsService = supabaseAnalyticsService;

// Blockchain API methods - now using Supabase
export const blockchainService = supabaseBlockchainService;

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

// Emergency Services API
export const emergencyServicesAPI = {
  // Get available service types
  getServiceTypes: () => api.get('/emergency-services/types'),

  // Calculate service fee
  calculateFee: (data) => api.post('/emergency-services/calculate-fee', data),

  // Book emergency service
  bookService: (data) => api.post('/emergency-services/book', data),

  // Get user bookings
  getUserBookings: (params = {}) => api.get('/emergency-services/bookings', { params }),

  // Get specific booking
  getBooking: (id) => api.get(`/emergency-services/bookings/${id}`),

  // Get payment status
  getPaymentStatus: (sessionId) => api.get(`/emergency-services/payment/${sessionId}/status`),

  // Admin endpoints
  admin: {
    getAllBookings: (params = {}) => api.get('/emergency-services/admin/bookings', { params }),
    updateBookingStatus: (id, data) => api.patch(`/emergency-services/admin/bookings/${id}/status`, data)
  }
};

export default api;
