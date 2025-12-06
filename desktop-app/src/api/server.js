/**
 * Express API Server
 * Phase 3: Basic Blocking
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('../database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'YouTube Monitor API',
    version: '0.3.0',
    phase: 3,
    status: 'running'
  });
});

// Import route handlers
const devicesRouter = require('./devices');
const watchHistoryRouter = require('./watchHistory');
const blocksRouter = require('./blocks');

// Mount routers
app.use('/api/v1/devices', devicesRouter);
app.use('/api/v1/devices', devicesRouter); // For backward compatibility
app.use('/api/v1/register', devicesRouter); // Registration endpoint
app.use('/api/v1/watch-history', watchHistoryRouter);
app.use('/api/v1/heartbeat', devicesRouter); // Heartbeat endpoint
app.use('/api/v1/blocks', blocksRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('[API] Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`[API] Server running on http://localhost:${PORT}`);
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('[API] Server error:', error);
      reject(error);
    });
  });
}

module.exports = { app, startServer };
