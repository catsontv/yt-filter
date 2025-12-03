const express = require('express');
const cors = require('cors');
const { getDatabase, saveDatabase, execQuery, getOne, getAll } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Middleware to check API key
function authenticateAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const device = getOne('SELECT * FROM devices WHERE api_key = ?', [apiKey]);

  if (!device) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.device = device;
  next();
}

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
app.post('/api/v1/register', (req, res) => {
  try {
    const { device_id, device_name } = req.body;

    if (!device_id || !device_name) {
      return res.status(400).json({ error: 'device_id and device_name required' });
    }
    
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
});

// Submit watch history
app.post('/api/v1/watch-history', authenticateAPIKey, (req, res) => {
  try {
    const { videos } = req.body;
    const deviceId = req.device.id;

    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ error: 'videos array required' });
    }

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
});

// Get blocks for device
app.get('/api/v1/blocks/:device_id', authenticateAPIKey, (req, res) => {
  try {
    const deviceId = req.params.device_id;

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
});

// Heartbeat
app.get('/api/v1/heartbeat/:device_id', authenticateAPIKey, (req, res) => {
  try {
    const deviceId = req.params.device_id;
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
});

function startAPIServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`API Server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

module.exports = {
  startAPIServer
};
