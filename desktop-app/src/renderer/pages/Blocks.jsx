/**
 * Blocks Page Component
 * Phase 3: Basic Blocking
 */

import React, { useState, useEffect } from 'react';
import '../styles/Blocks.css';

const Blocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBlock, setNewBlock] = useState({
    url: '',
    custom_message: '',
    device_id: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBlocks();
    fetchDevices();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchBlocks, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/blocks');
      const data = await response.json();
      if (data.success) {
        setBlocks(data.blocks);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
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
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newBlock.url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    // Basic YouTube URL validation
    if (!newBlock.url.includes('youtube.com') && !newBlock.url.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: newBlock.url,
          custom_message: newBlock.custom_message || null,
          device_id: newBlock.device_id === 'all' ? null : newBlock.device_id
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Block added successfully!');
        setNewBlock({ url: '', custom_message: '', device_id: null });
        setShowAddModal(false);
        fetchBlocks();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to add block');
      }
    } catch (error) {
      console.error('Error adding block:', error);
      setError('Failed to add block. Please try again.');
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!confirm('Are you sure you want to remove this block?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/blocks/${blockId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Block removed successfully!');
        fetchBlocks();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to remove block');
      }
    } catch (error) {
      console.error('Error deleting block:', error);
      setError('Failed to remove block. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDeviceName = (deviceId) => {
    if (!deviceId) return 'All Devices';
    const device = devices.find(d => d.id === deviceId);
    return device ? device.device_name : 'Unknown Device';
  };

  if (loading) {
    return (
      <div className="blocks-container">
        <div className="loading">Loading blocks...</div>
      </div>
    );
  }

  return (
    <div className="blocks-container">
      <div className="blocks-header">
        <div>
          <h1>Content Blocks</h1>
          <p>Manage blocked videos and channels</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Block
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {blocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚫</div>
          <h2>No blocks yet</h2>
          <p>Click "Add Block" to start blocking videos or channels</p>
        </div>
      ) : (
        <div className="blocks-list">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Content</th>
                <th>Applied To</th>
                <th>Custom Message</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map(block => (
                <tr key={block.id}>
                  <td>
                    <span className={`badge badge-${block.type}`}>
                      {block.type === 'video' ? '🎥 Video' : '📺 Channel'}
                    </span>
                  </td>
                  <td>
                    <div className="block-content">
                      {block.thumbnail_url && (
                        <img 
                          src={block.thumbnail_url} 
                          alt="Thumbnail"
                          className="block-thumbnail"
                        />
                      )}
                      <div>
                        <div className="block-title">{block.title}</div>
                        {block.channel_name && (
                          <div className="block-channel">{block.channel_name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{getDeviceName(block.device_id)}</td>
                  <td>
                    {block.custom_message ? (
                      <span className="custom-message">{block.custom_message}</span>
                    ) : (
                      <span className="no-message">—</span>
                    )}
                  </td>
                  <td>{formatDate(block.created_at)}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteBlock(block.id)}
                      title="Remove block"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Block Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Block</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddBlock}>
              <div className="form-group">
                <label htmlFor="url">YouTube URL *</label>
                <input
                  type="text"
                  id="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newBlock.url}
                  onChange={(e) => setNewBlock({ ...newBlock, url: e.target.value })}
                  required
                />
                <small>Paste a YouTube video or channel URL</small>
              </div>

              <div className="form-group">
                <label htmlFor="device">Apply To</label>
                <select
                  id="device"
                  value={newBlock.device_id || 'all'}
                  onChange={(e) => setNewBlock({ ...newBlock, device_id: e.target.value })}
                >
                  <option value="all">All Devices</option>
                  {devices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.device_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Custom Message (Optional)</label>
                <textarea
                  id="message"
                  placeholder="This content is not appropriate for..."
                  value={newBlock.custom_message}
                  onChange={(e) => setNewBlock({ ...newBlock, custom_message: e.target.value })}
                  rows={3}
                />
                <small>This message will appear when the block is triggered</small>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blocks;
