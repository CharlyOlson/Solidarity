/**
 * Mobile Device Tester for Solidarity Testing Interface
 * 
 * This module provides functionality to interact with the mobile-sync-server.js
 * and test connectivity with mobile devices in the Solidarity system.
 */

class MobileDeviceTester {
  constructor(config = {}) {
    this.config = {
      iPhonePort: 3001,
      iPadPort: 3002,
      watchPort: 3003,
      baseUrl: 'http://localhost',
      ...config
    };
    
    this.endpoints = {
      iPhone: `${this.config.baseUrl}:${this.config.iPhonePort}`,
      iPad: `${this.config.baseUrl}:${this.config.iPadPort}`,
      watch: `${this.config.baseUrl}:${this.config.watchPort}`
    };
    
    this.devices = [];
  }

  /**
   * Get server status from mobile sync server
   * @param {string} deviceType - 'iPhone', 'iPad', or 'watch'
   * @returns {Promise<object>} - Server status response
   */
  async getStatus(deviceType = 'iPhone') {
    try {
      if (!this.endpoints[deviceType]) {
        throw new Error(`Invalid device type: ${deviceType}`);
      }
      
      const response = await fetch(`${this.endpoints[deviceType]}/api/status`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting ${deviceType} status:`, error);
      throw error;
    }
  }

  /**
   * Register a new device with the mobile sync server
   * @param {object} device - Device information
   * @param {string} device.deviceName - Name of the device
   * @param {string} device.deviceType - Type of device ('iPhone', 'iPad', 'watch')
   * @param {string} device.deviceId - Unique device ID
   * @returns {Promise<object>} - Registration response
   */
  async registerDevice(device) {
    try {
      if (!device.deviceName || !device.deviceType || !device.deviceId) {
        throw new Error('Missing required device information');
      }
      
      if (!this.endpoints[device.deviceType]) {
        throw new Error(`Invalid device type: ${device.deviceType}`);
      }
      
      const response = await fetch(`${this.endpoints[device.deviceType]}/api/devices/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(device)
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      this.devices.push({...device, registered: true, lastSeen: result.serverTime});
      
      return result;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Send a heartbeat for an existing device
   * @param {string} deviceId - Device ID to send heartbeat for
   * @param {string} deviceType - Type of device ('iPhone', 'iPad', 'watch')
   * @returns {Promise<object>} - Heartbeat response
   */
  async sendHeartbeat(deviceId, deviceType = 'iPhone') {
    try {
      if (!deviceId) {
        throw new Error('Missing device ID');
      }
      
      if (!this.endpoints[deviceType]) {
        throw new Error(`Invalid device type: ${deviceType}`);
      }
      
      const response = await fetch(`${this.endpoints[deviceType]}/api/devices/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deviceId })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update device last seen time
      const deviceIndex = this.devices.findIndex(d => d.deviceId === deviceId);
      if (deviceIndex >= 0) {
        this.devices[deviceIndex].lastSeen = result.serverTime;
      }
      
      return result;
    } catch (error) {
      console.error('Error sending heartbeat:', error);
      throw error;
    }
  }

  /**
   * List files at a specific path on the server
   * @param {string} path - Path to list files from
   * @param {string} deviceType - Type of device to connect through
   * @returns {Promise<object>} - File listing response
   */
  async listFiles(path = '', deviceType = 'iPhone') {
    try {
      if (!this.endpoints[deviceType]) {
        throw new Error(`Invalid device type: ${deviceType}`);
      }
      
      const response = await fetch(`${this.endpoints[deviceType]}/api/files/${path}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * Sync a file to the server
   * @param {string} path - Path where to save the file
   * @param {string} content - File content
   * @param {string} deviceId - Device ID performing the sync
   * @param {string} deviceType - Type of device ('iPhone', 'iPad', 'watch')
   * @returns {Promise<object>} - Sync response
   */
  async syncFile(path, content, deviceId, deviceType = 'iPhone') {
    try {
      if (!path) {
        throw new Error('Missing file path');
      }
      
      if (!this.endpoints[deviceType]) {
        throw new Error(`Invalid device type: ${deviceType}`);
      }
      
      const response = await fetch(`${this.endpoints[deviceType]}/api/files/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          device: deviceId || 'unknown'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error syncing file:', error);
      throw error;
    }
  }

  /**
   * Get all registered devices
   * @returns {Array} - List of registered devices
   */
  getRegisteredDevices() {
    return [...this.devices];
  }

  /**
   * Generate a test mock device
   * @param {string} type - Device type ('iPhone', 'iPad', 'watch')
   * @returns {object} - Mock device object
   */
  generateMockDevice(type = 'iPhone') {
    const deviceTypes = {
      iPhone: {
        prefix: 'iPhone',
        models: ['11', '12', '13', '14', '15', 'SE', 'X', 'XR']
      },
      iPad: {
        prefix: 'iPad',
        models: ['Air', 'Mini', 'Pro 11"', 'Pro 12.9"']
      },
      watch: {
        prefix: 'Apple Watch',
        models: ['Series 7', 'Series 8', 'Ultra', 'SE']
      }
    };

    const deviceType = deviceTypes[type] || deviceTypes.iPhone;
    const randomModel = deviceType.models[Math.floor(Math.random() * deviceType.models.length)];
    const randomId = Math.random().toString(36).substring(2, 10);
    
    return {
      deviceId: `${type.toLowerCase()}-${randomId}`,
      deviceName: `${deviceType.prefix} ${randomModel}`,
      deviceType: type
    };
  }
}

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileDeviceTester;
}

// Export for ES6 modules
if (typeof exports !== 'undefined') {
  exports.MobileDeviceTester = MobileDeviceTester;
}
