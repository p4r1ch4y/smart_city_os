// Demo authentication utilities for Smart City OS
// This provides mock authentication functionality for development/demo purposes

// Demo users data
const DEMO_USERS = [
  {
    id: 'demo-admin-001',
    username: 'admin',
    email: 'admin@smartcity.local',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: null,
    permissions: ['read', 'write', 'delete', 'admin'],
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'demo-citizen-001',
    username: 'demo',
    email: 'demo@smartcity.local',
    firstName: 'Demo',
    lastName: 'Citizen',
    role: 'citizen',
    avatar: null,
    permissions: ['read'],
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'demo-operator-001',
    username: 'operator',
    email: 'operator@smartcity.local',
    firstName: 'System',
    lastName: 'Operator',
    role: 'operator',
    avatar: null,
    permissions: ['read', 'write'],
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'demo-test-001',
    username: 'test',
    email: 'test@smartcity.local',
    firstName: 'Test',
    lastName: 'User',
    role: 'citizen',
    avatar: null,
    permissions: ['read'],
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  }
];

// Demo passwords (for development only)
const DEMO_PASSWORDS = {
  'admin@smartcity.local': 'admin123',
  'demo@smartcity.local': 'demo123',
  'operator@smartcity.local': 'operator123',
  'test@smartcity.local': 'test123'
};

// Authentication functions
export const demoAuth = {
  // Sign in with demo credentials
  async signIn(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = DEMO_USERS.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (DEMO_PASSWORDS[email] !== password) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Store in localStorage for persistence
    localStorage.setItem('demo_auth_user', JSON.stringify(user));
    localStorage.setItem('demo_auth_token', generateDemoToken(user));
    
    return {
      user,
      token: generateDemoToken(user),
      session: {
        access_token: generateDemoToken(user),
        user
      }
    };
  },

  // Sign out
  async signOut() {
    localStorage.removeItem('demo_auth_user');
    localStorage.removeItem('demo_auth_token');
    return { success: true };
  },

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('demo_auth_user');
      const token = localStorage.getItem('demo_auth_token');
      
      if (userStr && token && isValidToken(token)) {
        return JSON.parse(userStr);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user;
  },

  // Sign up (demo mode - just add to demo users)
  async signUp(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { email, password, username, firstName, lastName, role = 'citizen' } = userData;
    
    // Check if user already exists
    if (DEMO_USERS.find(u => u.email === email || u.username === username)) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: `demo-${Date.now()}`,
      username,
      email,
      firstName,
      lastName,
      role,
      avatar: null,
      permissions: role === 'admin' ? ['read', 'write', 'delete', 'admin'] : 
                   role === 'operator' ? ['read', 'write'] : ['read'],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Add to demo users (in memory)
    DEMO_USERS.push(newUser);
    DEMO_PASSWORDS[email] = password;
    
    return {
      user: newUser,
      token: generateDemoToken(newUser)
    };
  },

  // Get all demo users (admin only)
  getDemoUsers() {
    return DEMO_USERS.map(user => ({
      ...user,
      password: undefined // Don't expose passwords
    }));
  },

  // Update user profile
  async updateProfile(userId, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = DEMO_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    DEMO_USERS[userIndex] = {
      ...DEMO_USERS[userIndex],
      ...updates,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // Update localStorage if it's the current user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('demo_auth_user', JSON.stringify(DEMO_USERS[userIndex]));
    }
    
    return DEMO_USERS[userIndex];
  }
};

// Helper functions
function generateDemoToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Simple base64 encoding for demo purposes (NOT secure for production)
  return btoa(JSON.stringify(payload));
}

function isValidToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (error) {
    return false;
  }
}

// User role utilities
export const roleUtils = {
  hasPermission(user, permission) {
    return user && user.permissions && user.permissions.includes(permission);
  },

  isAdmin(user) {
    return user && user.role === 'admin';
  },

  isOperator(user) {
    return user && (user.role === 'operator' || user.role === 'admin');
  },

  isCitizen(user) {
    return user && user.role === 'citizen';
  },

  canRead(user) {
    return this.hasPermission(user, 'read');
  },

  canWrite(user) {
    return this.hasPermission(user, 'write');
  },

  canDelete(user) {
    return this.hasPermission(user, 'delete');
  }
};

// Additional authentication functions for compatibility

export const isDemoAccount = (email) => {
  return DEMO_PASSWORDS.hasOwnProperty(email);
};

export const authenticateDemoUser = async (email, password) => {
  return demoAuth.signIn(email, password);
};

export const getDemoUserProfile = () => {
  return demoAuth.getCurrentUser();
};

export const storeDemoSession = (session) => {
  if (session?.user) {
    localStorage.setItem('demo_auth_user', JSON.stringify(session.user));
    localStorage.setItem('demo_auth_token', session.access_token || generateDemoToken(session.user));
  }
};

export const getDemoSession = () => {
  const user = demoAuth.getCurrentUser();
  const token = localStorage.getItem('demo_auth_token');
  
  if (user && token) {
    return {
      user,
      access_token: token
    };
  }
  
  return null;
};

export const clearDemoSession = () => {
  localStorage.removeItem('demo_auth_user');
  localStorage.removeItem('demo_auth_token');
};

// Auth state change listeners
let authStateListeners = [];

export const onDemoAuthStateChange = (callback) => {
  authStateListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    authStateListeners = authStateListeners.filter(listener => listener !== callback);
  };
};

export const triggerDemoAuthStateChange = (event, session) => {
  authStateListeners.forEach(listener => {
    try {
      listener(event, session);
    } catch (error) {
      console.error('Error in auth state listener:', error);
    }
  });
};

// Override signIn to trigger state change
const originalSignIn = demoAuth.signIn;
demoAuth.signIn = async (email, password) => {
  const result = await originalSignIn(email, password);
  triggerDemoAuthStateChange('SIGNED_IN', result.session);
  return result;
};

// Override signOut to trigger state change
const originalSignOut = demoAuth.signOut;
demoAuth.signOut = async () => {
  const result = await originalSignOut();
  triggerDemoAuthStateChange('SIGNED_OUT', null);
  return result;
};

export default demoAuth;