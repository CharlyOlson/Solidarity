import React, { useState } from 'react';
import client from '../api/client';

const DiscoveryTab = () => {
  const [discoveryResults, setDiscoveryResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDiscovery = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await client.runSystemDiscovery();
      setDiscoveryResults(results);
    } catch (err) {
      setError('Failed to run discovery: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discovery-tab">
      <div className="discovery-header">
        <h2>Solidarity System Discovery</h2>
        <p>Run discovery to find Solidarity installations and connected devices.</p>
        
        <button 
          onClick={runDiscovery} 
          disabled={loading}
          className="primary-button"
        >
          {loading ? 'Running Discovery...' : 'Run Discovery'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {discoveryResults && (
        <div className="discovery-results">
          <h3>Discovery Results</h3>
          <p className="timestamp">
            Timestamp: {new Date(discoveryResults.timestamp).toLocaleString()}
          </p>

          <div className="result-section">
            <h4>Installations ({discoveryResults.results.locations.length})</h4>
            <div className="locations-grid">
              {discoveryResults.results.locations.map((location, index) => (
                <div className="location-card" key={index}>
                  <div className="location-type">{location.type}</div>
                  <div className="location-path">{location.path}</div>
                  <div className="location-files">
                    <strong>Files:</strong> {location.files.join(', ')}
                  </div>
                  <div className="location-modified">
                    Last Modified: {new Date(location.lastModified).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="result-section">
            <h4>Connected Devices ({discoveryResults.results.devices.length})</h4>
            <div className="devices-grid">
              {discoveryResults.results.devices.map((device, index) => (
                <div 
                  className={`device-card ${device.status === 'online' ? 'online' : 'offline'}`} 
                  key={index}
                >
                  <div className="device-name">{device.name}</div>
                  <div className="device-type">{device.type}</div>
                  <div className="device-status">
                    <span className={`status-indicator ${device.status}`}></span>
                    {device.status}
                  </div>
                  <div className="device-last-seen">
                    Last Seen: {new Date(device.lastSeen).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Running discovery... please wait.</p>
        </div>
      )}

      {!loading && !discoveryResults && !error && (
        <div className="empty-state">
          <p>No discovery results yet. Click "Run Discovery" to begin.</p>
        </div>
      )}
    </div>
  );
};

export default DiscoveryTab;
