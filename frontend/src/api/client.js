// Solidarity Platform API Client
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const MOBILE_SYNC_BASE_URL = process.env.REACT_APP_MOBILE_SYNC_URL || 'http://localhost:3001/api';

class SolidarityClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Audio API
  async processAudio(phrase, audioData, assetSymbol = 'WEB_AUDIO') {
    const response = await this.client.post('/audio/process', {
      phrase,
      audioData,
      assetSymbol
    });
    return response.data;
  }

  async getAudioCommands() {
    const response = await this.client.get('/audio/commands');
    return response.data;
  }

  async getAudioStatus() {
    const response = await this.client.get('/audio/status');
    return response.data;
  }

  // Execute an audio command
  async executeAudioCommand(command) {
    const response = await this.client.post('/audio/command', { command });
    return response.data;
  }

  // Authentication API
  async login(email, password) {
    const response = await this.client.post('/auth/login', {
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await this.client.post('/auth/logout', { refreshToken });
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  // System API
  async getSystemStatus() {
    const response = await this.client.get('/system/status');
    return response.data;
  }
  
  // Run system discovery
  async runSystemDiscovery() {
    const response = await this.client.post('/system/discovery');
    return response.data;
  }
  
  // Get connected devices
  async getConnectedDevices() {
    const response = await this.client.get('/devices');
    return response.data;
  }

  // Mobile Sync API
  async getMobileSyncStatus() {
    try {
      const response = await axios.get(`${MOBILE_SYNC_BASE_URL}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mobile sync status:', error);
      throw error;
    }
  }

  async registerMobileDevice(device) {
    try {
      const deviceType = device.deviceType || 'iPhone';
      const baseUrl = `http://localhost:${deviceType === 'iPhone' ? '3001' : deviceType === 'iPad' ? '3002' : '3003'}/api`;
      
      const response = await axios.post(`${baseUrl}/devices/register`, device);
      return response.data;
    } catch (error) {
      console.error('Error registering mobile device:', error);
      throw error;
    }
  }

  async sendDeviceHeartbeat(deviceId, deviceType = 'iPhone') {
    try {
      const baseUrl = `http://localhost:${deviceType === 'iPhone' ? '3001' : deviceType === 'iPad' ? '3002' : '3003'}/api`;
      
      const response = await axios.post(`${baseUrl}/devices/heartbeat`, { deviceId });
      return response.data;
    } catch (error) {
      console.error('Error sending device heartbeat:', error);
      throw error;
    }
  }

  async getMobileFiles(path = '', deviceType = 'iPhone') {
    try {
      const baseUrl = `http://localhost:${deviceType === 'iPhone' ? '3001' : deviceType === 'iPad' ? '3002' : '3003'}/api`;
      
      const response = await axios.get(`${baseUrl}/files/${path}`);
      return response.data;
    } catch (error) {
      console.error('Error getting mobile files:', error);
      throw error;
    }
  }

  async syncMobileFile(path, content, deviceId, deviceType = 'iPhone') {
    try {
      const baseUrl = `http://localhost:${deviceType === 'iPhone' ? '3001' : deviceType === 'iPad' ? '3002' : '3003'}/api`;
      
      const response = await axios.post(`${baseUrl}/files/${path}`, {
        content,
        device: deviceId
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing mobile file:', error);
      throw error;
    }
  }
}

// Create an instance and export it
const clientInstance = new SolidarityClient();

export default clientInstance;