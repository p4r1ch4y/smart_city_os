import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: []
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        permissions: action.payload.permissions || [],
        isAuthenticated: true,
        isLoading: false
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case 'SET_TOKENS':
      return {
        ...state,
        tokens: action.payload
      };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
        if (tokens?.accessToken) {
          // Set the token in API headers
          authAPI.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
          
          // Verify token and get user profile
          const response = await authAPI.get('/auth/profile');
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              tokens,
              permissions: response.data.permissions
            }
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('tokens');
        delete authAPI.defaults.headers.common['Authorization'];
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authAPI.post('/auth/login', credentials);
      const { user, tokens } = response.data;
      
      // Store tokens
      localStorage.setItem('tokens', JSON.stringify(tokens));
      
      // Set authorization header
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      
      // Get user permissions
      const profileResponse = await authAPI.get('/auth/profile');
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          tokens,
          permissions: profileResponse.data.permissions
        }
      });
      
      toast.success(`Welcome back, ${user.firstName}!`);
      return { success: true };
      
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authAPI.post('/auth/register', userData);
      const { user, tokens } = response.data;
      
      // Store tokens
      localStorage.setItem('tokens', JSON.stringify(tokens));
      
      // Set authorization header
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      
      // Get user permissions
      const profileResponse = await authAPI.get('/auth/profile');
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          tokens,
          permissions: profileResponse.data.permissions
        }
      });
      
      toast.success(`Welcome to Smart City OS, ${user.firstName}!`);
      return { success: true };
      
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if authenticated
      if (state.tokens?.accessToken) {
        await authAPI.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('tokens');
      delete authAPI.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const refreshToken = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.post('/auth/refresh', {
        refreshToken: tokens.refreshToken
      });

      const newTokens = response.data.tokens;
      localStorage.setItem('tokens', JSON.stringify(newTokens));
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;
      
      dispatch({ type: 'SET_TOKENS', payload: newTokens });
      
      return newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await authAPI.put('/auth/profile', updates);
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    hasPermission,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
