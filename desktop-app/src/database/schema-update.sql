-- Phase 3: Add block_attempts table
-- This table stores when users try to access blocked content

CREATE TABLE IF NOT EXISTS block_attempts (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('video', 'channel')),
  video_title TEXT,
  channel_name TEXT,
  attempted_at TEXT NOT NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_block_attempts_device ON block_attempts(device_id);
CREATE INDEX IF NOT EXISTS idx_block_attempts_date ON block_attempts(attempted_at);
