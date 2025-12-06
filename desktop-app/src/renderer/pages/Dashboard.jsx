/**
 * Dashboard Page Component
 * Phase 3: Added block attempt statistics
 */

import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    totalVideos: 0,
    blockAttemptsToday: 0
  });
  const [devices, setDevices] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchDevices(),
        fetchWatchHistory(),
        fetchBlockStats()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/devices');
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
        
        // Calculate online devices (heartbeat within last 2 minutes)
        const now = Date.now();
        const onlineCount = data.devices.filter(device => {
          if (!device.last_heartbeat) return false;
          const lastSeen = new Date(device.last_heartbeat).getTime();
          return (now - lastSeen) < 120000; // 2 minutes
        }).length;
        
        setStats(prev => ({
          ...prev,
          totalDevices: data.devices.length,
          onlineDevices: onlineCount
        }));
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchWatchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/watch-history');
      const data = await response.json();
      
      if (data.success) {
        setStats(prev => ({
          ...prev,
          totalVideos: data.total
        }));
        
        // Get recent 5 videos
        setRecentHistory(data.videos.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching watch history:', error);
    }
  };

  const fetchBlockStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/blocks/attempts/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(prev => ({
          ...prev,
          blockAttemptsToday: data.stats.today
        }));
      }
    } catch (error) {
      console.error('Error fetching block stats:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getDeviceStatus = (device) => {
    if (!device.last_heartbeat) return 'offline';
    
    const now = Date.now();
    const lastSeen = new Date(device.last_heartbeat).getTime();
    const diffMs = now - lastSeen;
    
    return diffMs < 120000 ? 'online' : 'offline';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Monitor YouTube usage across all devices</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDevices}</div>
            <div className="stat-label">Total Devices</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon online">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.onlineDevices}</div>
            <div className="stat-label">Online Now</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalVideos}</div>
            <div className="stat-label">Videos Watched</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.blockAttemptsToday}</div>
            <div className="stat-label">Block Attempts Today</div>
          </div>
        </div>
      </div>

      {/* Devices List */}
      <div className="dashboard-section">
        <h2>Registered Devices</h2>
        {devices.length === 0 ? (
          <div className="empty-state">
            <p>📱 No devices registered yet</p>
            <p className="empty-hint">Install the extension on a device to get started</p>
          </div>
        ) : (
          <div className="devices-list">
            {devices.map(device => (
              <div key={device.id} className="device-card">
                <div className="device-info">
                  <div className="device-name">{device.device_name}</div>
                  <div className="device-meta">
                    {device.browser} • {device.os}
                  </div>
                </div>
                <div className={`device-status ${getDeviceStatus(device)}`}>
                  {getDeviceStatus(device) === 'online' ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        {recentHistory.length === 0 ? (
          <div className="empty-state">
            <p>📈 No activity yet</p>
            <p className="empty-hint">Watch history will appear here</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentHistory.map(video => (
              <div key={video.id} className="activity-item">
                <img 
                  src={video.thumbnail_url} 
                  alt="Thumbnail"
                  className="activity-thumbnail"
                />
                <div className="activity-info">
                  <div className="activity-title">{video.video_title}</div>
                  <div className="activity-meta">
                    {video.channel_name} • {formatDate(video.watched_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button 
            className="action-button"
            onClick={() => window.location.hash = '#/blocks'}
          >
            <span className="action-icon">🚫</span>
            <span>Manage Blocks</span>
          </button>
          <button 
            className="action-button"
            onClick={() => window.location.hash = '#/watch-history'}
          >
            <span className="action-icon">📄</span>
            <span>View Full History</span>
          </button>
          <button 
            className="action-button"
            onClick={() => window.location.hash = '#/devices'}
          >
            <span className="action-icon">⚙️</span>
            <span>Device Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
