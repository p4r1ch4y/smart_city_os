const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

console.log('🚀 Starting Smart City OS Backend (No Database Mode)...');

const app = express();
const IS_SERVERLESS = !!process.env.VERCEL || process.env.SERVERLESS === '1' || !!process.env.NOW_REGION;
let server = null;
let io = { emit: () => {} };

if (!IS_SERVERLESS) {
  server = http.createServer(app);
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim());
  io = socketIo(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"]
    }
  });
}

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for demo
let sensors = [];
let sensorData = [];
let alerts = [];
let users = [];

// Mock data initialization
const initializeMockData = () => {
  // Create some mock sensors
  const sensorTypes = ['traffic', 'waste', 'air_quality', 'noise', 'water_quality', 'energy', 'parking'];
  const locations = [
    { lat: 40.7589, lng: -73.9851, address: 'Times Square, NYC' },
    { lat: 40.7505, lng: -73.9934, address: 'Herald Square, NYC' },
    { lat: 40.7614, lng: -73.9776, address: 'Central Park, NYC' },
    { lat: 40.7282, lng: -74.0776, address: 'Financial District, NYC' },
    { lat: 40.7831, lng: -73.9712, address: 'Upper East Side, NYC' }
  ];

  sensorTypes.forEach((type, typeIndex) => {
    for (let i = 0; i < 3; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      sensors.push({
        id: sensors.length + 1,
        sensorId: `${type}_${String(typeIndex * 3 + i + 1).padStart(3, '0')}`,
        name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Sensor ${typeIndex * 3 + i + 1}`,
        type: type,
        status: Math.random() > 0.1 ? 'active' : 'offline',
        location: {
          latitude: location.lat + (Math.random() - 0.5) * 0.01,
          longitude: location.lng + (Math.random() - 0.5) * 0.01,
          address: location.address
        },
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });

  console.log(`✅ Initialized ${sensors.length} mock sensors`);
};

// Import routes (optionally skip blockchain to avoid heavy deps)
let blockchainRoutes = null;
if (process.env.SKIP_BLOCKCHAIN_ROUTES !== 'true') {
  try {
    blockchainRoutes = require('./routes/blockchain');
  } catch (e) {
    console.warn('Skipping blockchain routes due to import error:', e.message);
  }
}
let emergencyServicesRoutes = null;
try {
  emergencyServicesRoutes = require('./routes/emergencyServices');
} catch (e) {
  console.warn('Skipping emergency services routes due to import error:', e.message);
}

// Health check endpoint (aliases for serverless routing)
const healthHandler = (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Smart City OS Backend is running (No Database Mode)',
    sensors: sensors.length,
    alerts: alerts.length
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api', (req, res) => {
  res.json({
    ok: true,
    routes: ['/api/health', '/api/emergency-services', '/api/blockchain/status'],
  });
});

// Mount blockchain routes
if (blockchainRoutes) {
  app.use('/api/blockchain', blockchainRoutes);
} else {
  app.get('/api/blockchain/status', (req, res) => {
    res.json({ success: true, data: { initialized: false, message: 'Blockchain routes skipped' } });
  });
}

// Mount emergency services routes
if (emergencyServicesRoutes) {
  app.use('/api/emergency-services', emergencyServicesRoutes);
} else {
  app.all('/api/emergency-services/*', (req, res) => {
    res.status(503).json({ success: false, error: 'Emergency services unavailable in this deployment' });
  });
}
// Analytics proxy to Hugging Face Space (optional)
let analyticsProxy = null;
try {
  analyticsProxy = require('./routes/analyticsProxy');
} catch (e) {
  console.warn('Skipping analytics proxy due to import error:', e.message);
}
if (analyticsProxy) {
  app.use('/api/analytics', analyticsProxy);
}


// Auth endpoints (mock)
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;

  // Check if user exists
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const user = {
    id: users.length + 1,
    username,
    email,
    firstName,
    lastName,
    role: role || 'citizen',
    createdAt: new Date().toISOString()
  };

  users.push(user);

  // Mock JWT tokens
  const tokens = {
    accessToken: `mock-access-token-${user.id}`,
    refreshToken: `mock-refresh-token-${user.id}`
  };

  res.status(201).json({
    message: 'User registered successfully',
    user: { ...user, password: undefined },
    tokens
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  let user = users.find(u => u.email === email);

  // Create a default admin user if no users exist
  if (!user && users.length === 0) {
    user = {
      id: 1,
      username: 'admin',
      email: email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    users.push(user);
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const tokens = {
    accessToken: `mock-access-token-${user.id}`,
    refreshToken: `mock-refresh-token-${user.id}`
  };

  res.json({
    message: 'Login successful',
    user: { ...user, password: undefined },
    tokens
  });
});

app.get('/api/auth/profile', (req, res) => {
  // Mock auth check
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Extract user ID from mock token
  const token = authHeader.split(' ')[1];
  const userId = token.split('-').pop();
  const user = users.find(u => u.id == userId);

  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.json({
    user: { ...user, password: undefined },
    permissions: ['sensor:read', 'alert:read', 'analytics:read']
  });
});

// Sensor endpoints
app.get('/api/sensors', (req, res) => {
  res.json({
    sensors: sensors,
    total: sensors.length,
    page: 1,
    limit: 100
  });
});

app.post('/api/sensors', (req, res) => {
  const sensor = {
    id: sensors.length + 1,
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  sensors.push(sensor);
  res.status(201).json({ sensor });
});

app.post('/api/sensors/data', (req, res) => {
  const data = {
    id: sensorData.length + 1,
    ...req.body,
    timestamp: new Date().toISOString()
  };

  sensorData.push(data);

  // Emit real-time data via WebSocket
  io.emit('sensor-data', data);

  // Check for alerts (simple threshold check)
  const alertsGenerated = checkForAlerts(data);

  res.status(201).json({
    message: 'Data received successfully',
    data: data,
    alerts: alertsGenerated.length
  });
});

// Alert endpoints
app.get('/api/alerts', (req, res) => {
  res.json({
    alerts: alerts,
    total: alerts.length
  });
});

app.get('/api/alerts/stats', (req, res) => {
  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
    active: alerts.filter(a => a.status === 'active').length
  };

  res.json(stats);
});

// Simple alert checking function
const checkForAlerts = (sensorData) => {
  const alertsGenerated = [];
  const data = sensorData.data;

  // Traffic alerts
  if (data.congestion_level && data.congestion_level > 80) {
    const alert = createAlert(sensorData.sensorId, 'High Traffic Congestion', 'critical',
      `Congestion level at ${data.congestion_level}%`);
    alertsGenerated.push(alert);
  }

  // Air quality alerts
  if (data.aqi && data.aqi > 150) {
    const alert = createAlert(sensorData.sensorId, 'Poor Air Quality', 'high',
      `AQI level at ${data.aqi}`);
    alertsGenerated.push(alert);
  }

  // Waste alerts
  if (data.fill_percentage && data.fill_percentage > 90) {
    const alert = createAlert(sensorData.sensorId, 'Waste Bin Full', 'medium',
      `Fill level at ${data.fill_percentage}%`);
    alertsGenerated.push(alert);
  }

  return alertsGenerated;
};

const createAlert = (sensorId, title, severity, description) => {
  const alert = {
    id: alerts.length + 1,
    sensorId,
    title,
    severity,
    description,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  alerts.push(alert);
  io.emit('alert-created', alert);

  return alert;
};

// WebSocket connection handling
if (io && typeof io.on === 'function') {
  io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);

    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`📡 Client disconnected: ${socket.id}`);
    });
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Initialize mock data
initializeMockData();

// Start server only when run directly (not when imported by serverless runtime)
if (require.main === module) {
  if (!server) {
    server = http.createServer(app);
  }
  server.listen(PORT, () => {
    console.log(`✅ Smart City OS Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 WebSocket server ready`);
    console.log(`📊 Mock data: ${sensors.length} sensors initialized`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app;
