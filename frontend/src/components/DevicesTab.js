import { useState, useEffect } from 'react';
import client from '../api/client';

const DevicesTab = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const devicesList = await client.getConnectedDevices();
      setDevices(devicesList);
    } catch (err) {
      setError('Failed to load devices: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLastSeen = (lastSeen) => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffSeconds = Math.floor((now - lastSeenDate) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="devices-tab">
      <div className="devices-header">
        <h2>Connected Devices</h2>
        <button 
          onClick={fetchDevices} 
          disabled={loading}
          className="refresh-button"
        >
          Refresh Devices
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && !devices.length && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading devices...</p>
        </div>
      )}

      <div className="devices-content">
        <div className="device-stats">
          <div className="stat-card">
            <h3>Total Devices</h3>
            <div className="stat-value">{devices.length}</div>
          </div>
          
          <div className="stat-card">
            <h3>Online</h3>
            <div className="stat-value">{devices.filter(d => d.status === 'online').length}</div>
          </div>
          
          <div className="stat-card">
            <h3>Offline</h3>
            <div className="stat-value">{devices.filter(d => d.status === 'offline').length}</div>
          </div>
        </div>
        
        <div className="devices-list">
          {devices.length === 0 && !loading ? (
            <div className="no-devices">
              <p>No devices found.</p>
            </div>
          ) : (
            <div className="devices-grid">
              {devices.map((device, index) => (
                <div 
                  className={`device-card ${device.status}`} 
                  key={device.id || index}
                >
                  <div className="device-status">
                    <span className={`status-dot ${device.status}`}></span>
                    {device.status}
                  </div>
                  
                  <div className="device-name">{device.name}</div>
                  
                  <div className="device-type">
                    <span className={`device-icon ${device.type}`}></span>
                    {device.type}
                  </div>
                  
                  <div className="device-last-seen">
                    Last seen: {calculateLastSeen(device.lastSeen)}
                  </div>
                  
                  <div className="device-actions">
                    <button className="action-button connect">Connect</button>
                    <button className="action-button sync">Sync</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="device-network">
          <h3>Device Network</h3>
          <div className="network-visualization">
            {/* Placeholder for device network visualization */}
            {devices.length > 0 && (
              <div className="network-map">
                <div className="central-node">
                  <span>Hub</span>
                </div>
                
                {devices.map((device, index) => (
                  <div 
                    className={`network-node ${device.status}`} 
                    key={device.id || index}
                    style={{
                      left: `${20 + (60 * Math.cos(index * 2 * Math.PI / devices.length))}%`,
                      top: `${20 + (60 * Math.sin(index * 2 * Math.PI / devices.length))}%`
                    }}
                  >
                    <span className="node-label">{device.name}</span>
                    <div className={`connection-line ${device.status}`}></div>
                  </div>
                ))}
              </div>
            )}
            
            {devices.length === 0 && (
              <div className="empty-network">
                <p>No devices to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesTab;
