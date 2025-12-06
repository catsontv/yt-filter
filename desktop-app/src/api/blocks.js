/**
 * Block Management API Endpoints
 * Phase 3: Basic Blocking
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/v1/blocks/:device_id
 * Get all blocks for a device
 */
router.get('/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;

    // Verify device exists
    const device = await db.getDeviceById(device_id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Get all blocks (global + device-specific)
    const blocks = await db.getBlocksForDevice(device_id);

    res.json({
      success: true,
      device_id,
      blocks,
      count: blocks.length
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

/**
 * POST /api/v1/blocks
 * Add a new block
 */
router.post('/', async (req, res) => {
  try {
    const { url, type, custom_message, device_id } = req.body;

    // Validate required fields
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Extract video/channel ID from URL
    const extracted = extractYouTubeId(url);
    if (!extracted) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Fetch metadata from YouTube (title, channel)
    const metadata = await fetchYouTubeMetadata(extracted.id, extracted.type);

    // Create block entry
    const blockId = uuidv4();
    const block = {
      id: blockId,
      type: extracted.type, // 'video' or 'channel'
      youtube_id: extracted.id,
      title: metadata.title,
      channel_name: metadata.channel_name,
      thumbnail_url: metadata.thumbnail_url,
      custom_message: custom_message || null,
      device_id: device_id || null, // null = global block
      created_at: new Date().toISOString()
    };

    await db.addBlock(block);

    res.json({
      success: true,
      block
    });
  } catch (error) {
    console.error('Error adding block:', error);
    res.status(500).json({ error: 'Failed to add block' });
  }
});

/**
 * DELETE /api/v1/blocks/:block_id
 * Remove a block
 */
router.delete('/:block_id', async (req, res) => {
  try {
    const { block_id } = req.params;

    const deleted = await db.deleteBlock(block_id);

    if (!deleted) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({
      success: true,
      message: 'Block deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ error: 'Failed to delete block' });
  }
});

/**
 * GET /api/v1/blocks
 * Get all blocks (for UI display)
 */
router.get('/', async (req, res) => {
  try {
    const blocks = await db.getAllBlocks();

    res.json({
      success: true,
      blocks,
      count: blocks.length
    });
  } catch (error) {
    console.error('Error fetching all blocks:', error);
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

/**
 * POST /api/v1/block-attempts
 * Log a block attempt from extension
 */
router.post('/attempts', async (req, res) => {
  try {
    const { device_id, youtube_id, type, video_title, channel_name } = req.body;

    if (!device_id || !youtube_id) {
      return res.status(400).json({ error: 'device_id and youtube_id required' });
    }

    const attempt = {
      id: uuidv4(),
      device_id,
      youtube_id,
      type: type || 'video',
      video_title: video_title || 'Unknown',
      channel_name: channel_name || 'Unknown',
      attempted_at: new Date().toISOString()
    };

    await db.logBlockAttempt(attempt);

    res.json({
      success: true,
      message: 'Block attempt logged'
    });
  } catch (error) {
    console.error('Error logging block attempt:', error);
    res.status(500).json({ error: 'Failed to log block attempt' });
  }
});

/**
 * GET /api/v1/block-attempts/stats
 * Get block attempt statistics
 */
router.get('/attempts/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stats = await db.getBlockAttemptStats(today);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching block stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Helper function to extract YouTube video/channel ID from URL
function extractYouTubeId(url) {
  try {
    const urlObj = new URL(url);
    
    // Video URL patterns
    if (urlObj.hostname.includes('youtube.com')) {
      // Standard video: youtube.com/watch?v=VIDEO_ID
      if (urlObj.pathname === '/watch' && urlObj.searchParams.has('v')) {
        return {
          type: 'video',
          id: urlObj.searchParams.get('v')
        };
      }
      
      // Channel: youtube.com/channel/CHANNEL_ID or youtube.com/@username
      if (urlObj.pathname.startsWith('/channel/')) {
        return {
          type: 'channel',
          id: urlObj.pathname.split('/')[2]
        };
      }
      
      if (urlObj.pathname.startsWith('/@')) {
        return {
          type: 'channel',
          id: urlObj.pathname.substring(2) // Remove /@
        };
      }
      
      // /c/ format
      if (urlObj.pathname.startsWith('/c/')) {
        return {
          type: 'channel',
          id: urlObj.pathname.split('/')[2]
        };
      }
    }
    
    // Short URL: youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return {
        type: 'video',
        id: urlObj.pathname.substring(1)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

// Helper function to fetch YouTube metadata
async function fetchYouTubeMetadata(id, type) {
  // For now, return placeholder data
  // In production, this would call YouTube Data API
  // For Phase 3, we'll extract from the extension side
  
  return {
    title: type === 'video' ? `Video ${id}` : `Channel ${id}`,
    channel_name: 'Unknown Channel',
    thumbnail_url: type === 'video' 
      ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
      : null
  };
}

module.exports = router;
