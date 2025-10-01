import { useState, useEffect } from 'react';
import './App.css';
import apiClient from './api/client';
import logo from './logo.svg';
import DiscoveryTab from './components/DiscoveryTab';
import AudioTab from './components/AudioTab';
import SystemStatusTab from './components/SystemStatusTab';
import DevicesTab from './components/DevicesTab';
import MobileDeviceDashboard from './components/MobileDeviceDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState({ status: 'loading...' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load system status on component mount
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const status = await apiClient.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setSystemStatus({ 
        status: 'error', 
        message: 'Could not connect to server. Backend may not be running.' 
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Solidarity Platform</h1>
        
        <nav className="App-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
          <button 
            className={activeTab === 'discovery' ? 'active' : ''} 
            onClick={() => setActiveTab('discovery')}>
            Discovery
          </button>
          <button 
            className={activeTab === 'audio' ? 'active' : ''} 
            onClick={() => setActiveTab('audio')}>
            Audio Commands
          </button>
          <button 
            className={activeTab === 'devices' ? 'active' : ''} 
            onClick={() => setActiveTab('devices')}>
            Connected Devices
          </button>
          <button 
            className={activeTab === 'mobile' ? 'active' : ''} 
            onClick={() => setActiveTab('mobile')}>
            Mobile Sync
          </button>
          <button 
            className={activeTab === 'status' ? 'active' : ''} 
            onClick={() => setActiveTab('status')}>
            System Status
          </button>
        </nav>
      </header>

      <main className="App-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <section className="dashboard-section">
            <h2>System Dashboard</h2>
            <div className="status-card">
              <h3>System Status</h3>
              <p className={`status ${systemStatus.status === 'online' ? 'online' : 'offline'}`}>
                {systemStatus.status || 'Unknown'}
              </p>
              {systemStatus.message && <p>{systemStatus.message}</p>}
              <button onClick={fetchSystemStatus}>Refresh Status</button>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <button onClick={() => setActiveTab('discovery')}>Run Discovery</button>
              <button onClick={() => setActiveTab('audio')}>Execute Audio Command</button>
              <button onClick={() => setActiveTab('mobile')}>Mobile Device Sync</button>
              <button onClick={() => window.open('http://localhost:3000/api/docs', '_blank')}>API Documentation</button>
            </div>
          </section>
        )}

        {activeTab === 'discovery' && (
          <DiscoveryTab />
        )}

        {activeTab === 'audio' && (
          <AudioTab />
        )}

        {activeTab === 'devices' && (
          <DevicesTab />
        )}

        {activeTab === 'mobile' && (
          <MobileDeviceDashboard />
        )}

        {activeTab === 'status' && (
          <SystemStatusTab />
        )}
      </main>
    </div>
  );
}

export default App;
