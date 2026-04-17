import { useState, useEffect } from 'react';
import apiClient from '../api/client';

/**
 * MobileDeviceDashboard Component
 *
 * A React component for displaying and interacting with mobile devices
 * connected to the Solidarity Mobile Sync Server.
 */
const MobileDeviceDashboard = () => {
  // State
  const [devices, setDevices] = useState([]);
  const [serverStatus, setServerStatus] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newDeviceForm, setNewDeviceForm] = useState({
    deviceName: '',
    deviceType: 'iPhone',
    deviceId: ''
  });

  // Fetch server status on component mount
  useEffect(() => {
    fetchServerStatus();
    // Poll for status every 10 seconds
    const statusInterval = setInterval(fetchServerStatus, 10000);
    return () => clearInterval(statusInterval);
  }, []);

  // Fetch server status
  const fetchServerStatus = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.client.get('/system/status');
      setServerStatus(response.data);
      // Update devices list from server response
      if (response.data.sync && response.data.sync.connectedDevices) {
        setDevices(response.data.sync.connectedDevices);
      }
      setError(null);
    } catch (err) {
      setError('Failed to connect to server. Make sure it is running.');
      console.error('Error fetching server status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch files for a specific path
  const fetchFiles = async (filePath = '') => {
    if (!selectedDevice) return;

    setIsLoading(true);
    try {
      const response = await apiClient.client.get(`/files/${filePath}`);
      setFiles(response.data.files || []);
      setCurrentPath(filePath);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch files: ${err.message}`);
      console.error('Error fetching files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to a directory
  const navigateToDirectory = (path) => {
    fetchFiles(path);
  };

  // Navigate up one directory
  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    fetchFiles(parentPath);
  };

  // Register a new device
  const registerDevice = async (e) => {
    e.preventDefault();
    if (!newDeviceForm.deviceName || !newDeviceForm.deviceType) {
      setError('Device name and type are required');
      return;
    }

    setIsLoading(true);
    try {
      // Generate a device ID if not provided
      const deviceId = newDeviceForm.deviceId ||
        `${newDeviceForm.deviceType.toLowerCase()}-${Math.random().toString(36).substring(2, 10)}`;

      await apiClient.client.post('/devices/register', {
        deviceName: newDeviceForm.deviceName,
        deviceType: newDeviceForm.deviceType,
        deviceId
      });

      // Refresh devices list
      fetchServerStatus();

      // Reset form
      setNewDeviceForm({
        deviceName: '',
        deviceType: 'iPhone',
        deviceId: ''
      });

      setError(null);
    } catch (err) {
      setError(`Failed to register device: ${err.message}`);
      console.error('Error registering device:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Send heartbeat for a device
  const sendHeartbeat = async (device) => {
    if (!device || !device.deviceId) return;

    setIsLoading(true);
    try {
      await apiClient.client.post('/devices/heartbeat', {
        deviceId: device.deviceId
      });

      // Refresh devices list
      fetchServerStatus();
      setError(null);
    } catch (err) {
      setError(`Failed to send heartbeat: ${err.message}`);
      console.error('Error sending heartbeat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a device
  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    setFiles([]);
    setCurrentPath('');
    fetchFiles('');
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Check if device was seen within the last 5 minutes
  const isDeviceActive = (lastSeen) => {
    if (!lastSeen) return false;
    const seenDate = new Date(lastSeen);
    const now = new Date();
    return (now - seenDate) < 5 * 60 * 1000; // 5 minutes in milliseconds
  };

  return (
    <div className="mobile-device-dashboard">
      <h2>Mobile Device Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-grid">
        {/* Server Status Panel */}
        <div className="dashboard-panel">
          <h3>Server Status</h3>
          {isLoading && !serverStatus && <div className="loading">Loading server status...</div>}
          
          {serverStatus ? (
            <div className="status-details">
              <div className="status-item">
                <span>Status:</span> 
                <span className={`status-badge ${serverStatus.status === 'online' ? 'status-online' : 'status-offline'}`}>
                  {serverStatus.status}
                </span>
              </div>
              <div className="status-item">
                <span>Server Time:</span> {formatDate(serverStatus.serverTime)}
              </div>
              <div className="status-item">
                <span>Last Sync:</span> {formatDate(serverStatus.sync?.lastSync)}
              </div>
              <div className="status-item">
                <span>iPhone Port:</span> {serverStatus.config?.iPhonePort || 3001}
              </div>
              <div className="status-item">
                <span>iPad Port:</span> {serverStatus.config?.iPadPort || 3002}
              </div>
              <div className="status-item">
                <span>Logging:</span> {serverStatus.config?.enableLogging ? 'Enabled' : 'Disabled'}
              </div>
              <button 
                className="refresh-button"
                onClick={fetchServerStatus}
                disabled={isLoading}
              >
                Refresh Status
              </button>
            </div>
          ) : !isLoading && (
            <div className="status-offline">
              <p>Mobile Sync Server is not responding</p>
              <button 
                className="refresh-button"
                onClick={fetchServerStatus}
                disabled={isLoading}
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Device List Panel */}
        <div className="dashboard-panel">
          <h3>Connected Devices</h3>
          
          {devices.length > 0 ? (
            <div className="device-list">
              {devices.map((device) => (
                <div 
                  key={device.deviceId}
                  className={`device-item ${selectedDevice?.deviceId === device.deviceId ? 'selected' : ''}`}
                  onClick={() => handleDeviceSelect(device)}
                >
                  <div className="device-name">
                    {device.deviceName || 'Unnamed Device'}
                    <span className={`device-status ${isDeviceActive(device.lastSeen) ? 'status-online' : 'status-offline'}`}>
                      {isDeviceActive(device.lastSeen) ? '●' : '○'}
                    </span>
                  </div>
                  <div className="device-type">{device.deviceType}</div>
                  <div className="device-actions">
                    <button 
                      className="heartbeat-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendHeartbeat(device);
                      }}
                      disabled={isLoading}
                    >
                      Heartbeat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-devices">
              <p>No devices connected</p>
            </div>
          )}
          
          <div className="device-registration">
            <h4>Register New Device</h4>
            <form onSubmit={registerDevice}>
              <div className="form-group">
                <label htmlFor="deviceName">Device Name:</label>
                <input
                  id="deviceName"
                  type="text"
                  value={newDeviceForm.deviceName}
                  onChange={(e) => setNewDeviceForm({...newDeviceForm, deviceName: e.target.value})}
                  placeholder="My iPhone"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deviceType">Device Type:</label>
                <select
                  id="deviceType"
                  value={newDeviceForm.deviceType}
                  onChange={(e) => setNewDeviceForm({...newDeviceForm, deviceType: e.target.value})}
                >
                  <option value="iPhone">iPhone</option>
                  <option value="iPad">iPad</option>
                  <option value="watch">Apple Watch</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="deviceId">Device ID (optional):</label>
                <input
                  id="deviceId"
                  type="text"
                  value={newDeviceForm.deviceId}
                  onChange={(e) => setNewDeviceForm({...newDeviceForm, deviceId: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <button
                type="submit"
                className="register-button"
                disabled={isLoading}
              >
                Register Device
              </button>
            </form>
          </div>
        </div>

        {/* File Browser Panel */}
        <div className="dashboard-panel file-browser">
          <h3>File Browser</h3>
          
          {!selectedDevice ? (
            <div className="no-device-selected">
              <p>Select a device to browse files</p>
            </div>
          ) : (
            <>
              <div className="file-navigation">
                <button 
                  className="nav-button"
                  onClick={navigateUp}
                  disabled={!currentPath || isLoading}
                >
                  Up
                </button>
                <div className="current-path">
                  Path: {currentPath || '/'}
                </div>
                <button 
                  className="refresh-button"
                  onClick={() => fetchFiles(currentPath)}
                  disabled={isLoading}
                >
                  Refresh
                </button>
              </div>
              
              {isLoading ? (
                <div className="loading">Loading files...</div>
              ) : (
                <div className="file-list">
                  {files.length > 0 ? (
                    files.map((file, index) => (
                      <div 
                        key={index}
                        className={`file-item ${file.isDirectory ? 'directory' : 'file'}`}
                        onClick={() => file.isDirectory && navigateToDirectory(file.path)}
                      >
                        <span className="file-icon">{file.isDirectory ? '📁' : '📄'}</span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-date">{formatDate(file.lastModified)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-directory">
                      <p>Directory is empty</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sync Status Panel */}
        <div className="dashboard-panel">
          <h3>Sync Status</h3>
          
          {serverStatus?.sync ? (
            <div className="sync-details">
              <h4>Recent Syncs</h4>
              {serverStatus.sync.syncQueue?.length > 0 ? (
                <div className="sync-list">
                  {serverStatus.sync.syncQueue.map((sync, index) => (
                    <div key={index} className="sync-item">
                      <div className="sync-path">{sync.path}</div>
                      <div className="sync-info">
                        <span>{sync.device}</span>
                        <span>{formatDate(sync.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recent syncs</p>
              )}
              
              <h4>Sync Errors</h4>
              {serverStatus.sync.syncErrors?.length > 0 ? (
                <div className="error-list">
                  {serverStatus.sync.syncErrors.map((error, index) => (
                    <div key={index} className="error-item">
                      <div className="error-path">{error.path}</div>
                      <div className="error-message">{error.error}</div>
                      <div className="error-time">{formatDate(error.timestamp)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No sync errors</p>
              )}
            </div>
          ) : (
            <div className="no-sync-data">
              <p>Sync data not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDeviceDashboard;
