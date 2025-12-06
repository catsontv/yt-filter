/**
 * Database operations for blocks
 * Phase 3: Basic Blocking
 */

const db = require('./index');

/**
 * Add a new block
 */
async function addBlock(block) {
  const query = `
    INSERT INTO blocks (
      id, type, youtube_id, title, channel_name, 
      thumbnail_url, custom_message, device_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await db.run(query, [
    block.id,
    block.type,
    block.youtube_id,
    block.title,
    block.channel_name,
    block.thumbnail_url,
    block.custom_message,
    block.device_id,
    block.created_at
  ]);
  
  return block;
}

/**
 * Get all blocks
 */
async function getAllBlocks() {
  const query = `
    SELECT * FROM blocks 
    ORDER BY created_at DESC
  `;
  
  return await db.all(query);
}

/**
 * Get blocks for a specific device
 * Returns global blocks (device_id = null) + device-specific blocks
 */
async function getBlocksForDevice(deviceId) {
  const query = `
    SELECT * FROM blocks 
    WHERE device_id IS NULL OR device_id = ?
    ORDER BY created_at DESC
  `;
  
  return await db.all(query, [deviceId]);
}

/**
 * Delete a block
 */
async function deleteBlock(blockId) {
  const query = `DELETE FROM blocks WHERE id = ?`;
  const result = await db.run(query, [blockId]);
  return result.changes > 0;
}

/**
 * Check if a YouTube ID is blocked for a device
 */
async function isBlocked(youtubeId, deviceId) {
  const query = `
    SELECT COUNT(*) as count FROM blocks 
    WHERE youtube_id = ? AND (device_id IS NULL OR device_id = ?)
  `;
  
  const result = await db.get(query, [youtubeId, deviceId]);
  return result.count > 0;
}

/**
 * Log a block attempt
 */
async function logBlockAttempt(attempt) {
  const query = `
    INSERT INTO block_attempts (
      id, device_id, youtube_id, type, 
      video_title, channel_name, attempted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  await db.run(query, [
    attempt.id,
    attempt.device_id,
    attempt.youtube_id,
    attempt.type,
    attempt.video_title,
    attempt.channel_name,
    attempt.attempted_at
  ]);
}

/**
 * Get block attempt statistics
 */
async function getBlockAttemptStats(date) {
  const query = `
    SELECT COUNT(*) as total_attempts
    FROM block_attempts
    WHERE DATE(attempted_at) = DATE(?)
  `;
  
  const result = await db.get(query, [date]);
  return {
    today: result.total_attempts || 0
  };
}

/**
 * Get recent block attempts
 */
async function getRecentBlockAttempts(limit = 50) {
  const query = `
    SELECT ba.*, d.device_name
    FROM block_attempts ba
    LEFT JOIN devices d ON ba.device_id = d.id
    ORDER BY ba.attempted_at DESC
    LIMIT ?
  `;
  
  return await db.all(query, [limit]);
}

module.exports = {
  addBlock,
  getAllBlocks,
  getBlocksForDevice,
  deleteBlock,
  isBlocked,
  logBlockAttempt,
  getBlockAttemptStats,
  getRecentBlockAttempts
};
