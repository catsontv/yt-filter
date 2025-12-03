const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const { getDatabase, saveDatabase, execQuery, getOne, getAll } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));

// CORS configuration - only allow localhost
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Only allow localhost origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost',
      'http://127.0.0.1'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 registration attempts per hour
  message: 'Too many registration attempts, please try again later.',
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Middleware to check API key
function authenticateAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Validate API key format (should be UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }

  try {
    const device = getOne('SELECT * FROM devices WHERE api_key = ?', [apiKey]);

    if (!device) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.device = device;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Validation middleware helper
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'YouTube Monitor API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'POST /api/v1/register': 'Register a new device',
      'POST /api/v1/watch-history': 'Submit watch history',
      'GET /api/v1/blocks/:device_id': 'Get blocks for device',
      'GET /api/v1/heartbeat/:device_id': 'Send heartbeat'
    }
  });
});

// Register device
app.post('/api/v1/register',
  registerLimiter,
  [
    body('device_id')
      .trim()
      .isLength({ min: 1, max: 255 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('device_id must be alphanumeric with hyphens/underscores'),
    body('device_name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('device_name must be 1-255 characters'),
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const { device_id, device_name } = req.body;
      
      // Check if device already exists
      const existing = getOne('SELECT * FROM devices WHERE id = ?', [device_id]);
      
      if (existing) {
        return res.json({
          device_id: existing.id,
          api_key: existing.api_key,
          message: 'Device already registered'
        });
      }

      // Generate API key
      const apiKey = uuidv4();
      const now = Date.now();

      // Insert device
      execQuery(`
        INSERT INTO devices (id, name, api_key, last_heartbeat, created_at, is_online)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [device_id, device_name, apiKey, now, now]);

      res.json({
        device_id,
        api_key: apiKey,
        message: 'Device registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Submit watch history
app.post('/api/v1/watch-history',
  authenticateAPIKey,
  [
    body('videos')
      .isArray({ min: 1, max: 100 })
      .withMessage('videos must be an array with 1-100 items'),
    body('videos.*.video_id')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('video_id is required'),
    body('videos.*.title')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('title must be max 500 characters'),
    body('videos.*.channel_name')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('channel_name must be max 255 characters'),
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const { videos } = req.body;
      const deviceId = req.device.id;

      for (const video of videos) {
        execQuery(`
          INSERT INTO watch_history (
            device_id, video_id, title, channel_name, channel_id,
            thumbnail_url, video_url, watched_at, duration
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          deviceId,
          video.video_id,
          video.title || null,
          video.channel_name || null,
          video.channel_id || null,
          video.thumbnail_url || null,
          video.video_url || null,
          video.watched_at || Date.now(),
          video.duration || null
        ]);
      }

      res.json({
        success: true,
        count: videos.length,
        message: 'Watch history saved'
      });
    } catch (error) {
      console.error('Watch history error:', error);
      res.status(500).json({ error: 'Failed to save watch history' });
    }
  }
);

// Get blocks for device
app.get('/api/v1/blocks/:device_id',
  authenticateAPIKey,
  [
    param('device_id')
      .trim()
      .isLength({ min: 1, max: 255 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Invalid device_id'),
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const deviceId = req.params.device_id;
      
      // Ensure the requesting device matches the device_id in URL
      if (req.device.id !== deviceId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get global blocks (device_id is NULL) and device-specific blocks
      const blocks = getAll(`
        SELECT * FROM blocks 
        WHERE device_id IS NULL OR device_id = ?
        ORDER BY created_at DESC
      `, [deviceId]);

      res.json({
        device_id: deviceId,
        blocks: blocks,
        count: blocks.length
      });
    } catch (error) {
      console.error('Get blocks error:', error);
      res.status(500).json({ error: 'Failed to get blocks' });
    }
  }
);

// Heartbeat
app.get('/api/v1/heartbeat/:device_id',
  authenticateAPIKey,
  [
    param('device_id')
      .trim()
      .isLength({ min: 1, max: 255 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Invalid device_id'),
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const deviceId = req.params.device_id;
      
      // Ensure the requesting device matches the device_id in URL
      if (req.device.id !== deviceId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const now = Date.now();

      execQuery(`
        UPDATE devices 
        SET last_heartbeat = ?, is_online = 1
        WHERE id = ?
      `, [now, deviceId]);

      res.json({
        device_id: deviceId,
        timestamp: now,
        status: 'ok'
      });
    } catch (error) {
      console.error('Heartbeat error:', error);
      res.status(500).json({ error: 'Heartbeat failed' });
    }
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

function startAPIServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`API Server running on http://127.0.0.1:${PORT}`);
      console.log('Security features enabled:');
      console.log('  - Helmet security headers');
      console.log('  - Rate limiting');
      console.log('  - Input validation');
      console.log('  - CORS restrictions');
      console.log('  - API key authentication');
      resolve(server);
    });
  });
}

module.exports = {
  startAPIServer
};
