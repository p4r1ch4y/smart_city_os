import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'dummy-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table names
export const TABLES = {
  SENSORS: 'sensors',
  SENSOR_DATA: 'sensor_data',
  ALERTS: 'alerts',
  USERS: 'users',
  BLOCKCHAIN_TRANSACTIONS: 'blockchain_transactions',
  CONTRACTS: 'contracts',
  AIR_QUALITY: 'air_quality'
};

// Supabase helper functions
export const supabaseHelpers = {
  // Authentication helpers
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Data helpers
  async fetchSensors() {
    try {
      const { data, error } = await supabase
        .from(TABLES.SENSORS)
        .select('*');
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async fetchSensorData(sensorId, timeRange = '24h') {
    try {
      let query = supabase
        .from(TABLES.SENSOR_DATA)
        .select('*')
        .eq('sensor_id', sensorId)
        .order('timestamp', { ascending: false });

      // Add time range filter
      const now = new Date();
      let startTime;
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      query = query.gte('timestamp', startTime.toISOString());

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async fetchAlerts() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ALERTS)
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Real-time subscriptions
  subscribeToSensorData(callback) {
    return supabase
      .channel('sensor_data_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.SENSOR_DATA
        },
        callback
      )
      .subscribe();
  },

  subscribeToAlerts(callback) {
    return supabase
      .channel('alerts_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.ALERTS
        },
        callback
      )
      .subscribe();
  },

  // Utility functions
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from(TABLES.SENSORS)
        .select('count')
        .limit(1);
      return { connected: !error, error };
    } catch (error) {
      return { connected: false, error };
    }
  }
  ,

  // User profile helpers
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

export default supabase;