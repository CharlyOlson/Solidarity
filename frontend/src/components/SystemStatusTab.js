import { useState, useEffect } from 'react';
import client from '../api/client';

const SystemStatusTab = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    fetchSystemStatus();
    
    // Set up automatic refresh every 5 seconds
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 5000);
    
    setRefreshInterval(interval);
    
    // Clean up on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const fetchSystemStatus = async () => {
    setLoading(true);
    
    try {
      const status = await client.getSystemStatus();
      setSystemStatus(status);
      setError(null);
    } catch (err) {
      setError('Failed to load system status: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'Unknown';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
    result += `${secs}s`;
    
    return result;
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return 'status-online';
      case 'offline':
        return 'status-offline';
      case 'warning':
        return 'status-warning';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  };

  return (
    <div className="system-status-tab">
      <div className="status-header">
        <h2>System Status</h2>
        <button 
          onClick={fetchSystemStatus}
          disabled={loading}
          className="refresh-button"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && !systemStatus && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading system status...</p>
        </div>
      )}

      {systemStatus && (
        <div className="status-content">
          <div className="status-panel">
            <div className={`status-indicator ${getStatusClass(systemStatus.status)}`}>
              <div className="status-dot"></div>
              <span className="status-text">{systemStatus.status}</span>
            </div>
            
            <div className="version-info">
              <span>Version</span>
              <span>{systemStatus.version}</span>
            </div>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Uptime</h3>
              <div className="metric-value">{formatUptime(systemStatus.uptime)}</div>
              <div className="metric-subtitle">Since {new Date(systemStatus.startTime).toLocaleString()}</div>
            </div>
            
            <div className="metric-card">
              <h3>Environment</h3>
              <div className="metric-value environment">{systemStatus.environment}</div>
              <div className="metric-subtitle">Current system environment</div>
            </div>
            
            <div className="metric-card">
              <h3>Last Updated</h3>
              <div className="metric-value">{new Date().toLocaleTimeString()}</div>
              <div className="metric-subtitle">Auto-refreshes every 5s</div>
            </div>
          </div>
          
          <div className="status-visualization">
            <h3>System Visualization</h3>
            <div className="visualization-container">
              {/* Placeholder for future system visualization */}
              <div className="placeholder-visual">
                <div className="pulse"></div>
                <div className="system-node main"></div>
                <div className="system-node node1"></div>
                <div className="system-node node2"></div>
                <div className="system-node node3"></div>
                <div className="connector connector1"></div>
                <div className="connector connector2"></div>
                <div className="connector connector3"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatusTab;
