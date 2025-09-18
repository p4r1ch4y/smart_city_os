const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const sensorRoutes = require('./routes/sensors');
const alertRoutes = require('./routes/alerts');
const { authMiddleware } = require('./middleware/auth');
const { rateLimiterMiddleware } = require('./middleware/rateLimiter');
const blockchainService = require('./services/blockchainService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_API_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiterMiddleware);

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint (includes DB status)
app.get('/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await sequelize.authenticate({ logging: false });
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'disconnected';
  }
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    db: dbStatus
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', authMiddleware, sensorRoutes);
app.use('/api/alerts', authMiddleware, alertRoutes);
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/advanced-analytics', authMiddleware, require('./routes/advancedAnalytics'));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

// Database connection and server start with retry and optional fallback
const startServer = async () => {
  const FALLBACK_NO_DB = process.env.FALLBACK_NO_DB === 'true';
  const MAX_RETRIES = Number(process.env.WAIT_FOR_DB_RETRIES || 10);
  const RETRY_DELAY_MS = Number(process.env.WAIT_FOR_DB_DELAY_MS || 2000);

  let connected = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      connected = true;
      break;
    } catch (error) {
      console.error(`DB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error.message || error);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  if (!connected) {
    if (FALLBACK_NO_DB) {
      console.warn('Starting server in NO-DB fallback mode due to DB connection failure.');
      // Start server without syncing
      server.listen(PORT, () => {
        console.log(`Smart City OS Server (NO-DB mode) running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
      });
      return;
    }
    console.error('Unable to connect to DB after retries. Exiting.');
    process.exit(1);
  }

  try {
    await sequelize.sync({ force: false });
    console.log('Database synchronized.');

    // Initialize blockchain service
    try {
      await blockchainService.initialize();
      console.log('✅ Blockchain service initialized successfully.');
    } catch (blockchainError) {
      console.warn('⚠️ Blockchain service initialization failed:', blockchainError.message);
      console.warn('⚠️ Continuing without blockchain logging...');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Smart City OS Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🤖 Analytics Service: http://localhost:5000`);
      console.log(`⛓️ Blockchain Service: ${blockchainService.getServiceStatus().initialized ? 'Active' : 'Inactive'}`);
    });
  } catch (error) {
    console.error('Unable to start server after DB connection:', error.message || error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
