import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);
  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);

        if (session?.user) {
          await handleUserSession(session);
        } else {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        await handleUserSession(session);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in getInitialSession:', error);
      setLoading(false);
    }
  };

  const handleUserSession = async (session) => {
    try {
      setSession(session);

      // Get user profile from our users table
      const { data: userProfile, error } = await supabaseHelpers.getUserProfile(session.user.id);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user profile:', error);
      }

      // Combine auth user data with profile data
      const userData = {
        id: session.user.id,
        email: session.user.email,
        firstName: userProfile?.first_name || session.user.user_metadata?.first_name || '',
        lastName: userProfile?.last_name || session.user.user_metadata?.last_name || '',
        role: userProfile?.role || 'viewer',
        department: userProfile?.department || '',
        phone: userProfile?.phone || '',
        avatarUrl: userProfile?.avatar_url || session.user.user_metadata?.avatar_url || '',
        isActive: userProfile?.is_active !== false,
        lastLogin: userProfile?.last_login,
        createdAt: userProfile?.created_at || session.user.created_at
      };

      setUser(userData);
      setIsAuthenticated(true);

      // Update last login time
      if (userProfile) {
        await supabaseHelpers.updateUserProfile(session.user.id, {
          last_login: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error handling user session:', error);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { email, password } = credentials;
      const { data, error } = await supabaseHelpers.signIn(email, password);

      if (error) {
        toast.error(error.message || 'Login failed');
        return {
          success: false,
          error: error.message || 'Login failed'
        };
      }

      // Session will be handled by the auth state change listener
      toast.success('Welcome back!');
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const { email, password, firstName, lastName, role = 'viewer', department = '' } = userData;

      const { data, error } = await supabaseHelpers.signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        role,
        department
      });

      if (error) {
        toast.error(error.message || 'Registration failed');
        return {
          success: false,
          error: error.message || 'Registration failed'
        };
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      return {
        success: true,
        data,
        message: 'Registration successful! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseHelpers.signOut();

      if (error) {
        console.error('Logout error:', error);
      }

      // Clear local state
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);

      toast.success('Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabaseHelpers.updateUserProfile(user.id, {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        department: profileData.department,
        phone: profileData.phone,
        updated_at: new Date().toISOString()
      });

      if (error) {
        toast.error(error.message || 'Profile update failed');
        return {
          success: false,
          error: error.message || 'Profile update failed'
        };
      }

      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        firstName: data.first_name,
        lastName: data.last_name,
        department: data.department,
        phone: data.phone
      }));

      toast.success('Profile updated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Profile update failed');
      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast.error(error.message || 'Password reset failed');
        return {
          success: false,
          error: error.message || 'Password reset failed'
        };
      }

      toast.success('Password reset email sent! Please check your inbox.');
      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Password reset failed');
      return {
        success: false,
        error: error.message || 'Password reset failed'
      };
    }
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    hasRole,
    hasAnyRole,
    supabase // Expose supabase client for direct access if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
