# Mobile Device Testing Interface

This document provides information on how to use the Mobile Device Testing Interface for the Solidarity project.

## Overview

The Mobile Device Testing Interface allows you to:
- Register and manage virtual mobile devices (iPhone, iPad, Apple Watch)
- Send heartbeats from devices to maintain connection
- Browse files on the mobile sync server
- Sync files between devices and the server
- Monitor sync status and history

## Components

The Mobile Device Testing Interface consists of the following components:

1. **Mobile Sync Server**: A Node.js server that handles requests from mobile devices and manages file synchronization
2. **MobileDeviceTester**: A JavaScript class that provides programmatic access to the Mobile Sync Server
3. **Mobile Device Dashboard**: A React component that provides a user interface for the testing interface

## Getting Started

### Starting the Mobile Testing Environment

1. Run the `start-mobile-testing.bat` script to start the Mobile Sync Server:
   ```
   .\start-mobile-testing.bat
   ```

2. This will start the following servers:
   - iPhone Sync Server: http://localhost:3001
   - iPad Sync Server: http://localhost:3002
   - Apple Watch Server: http://localhost:3003

3. You can also choose to start the frontend development server from the script, which will make the Mobile Device Dashboard available at http://localhost:3000

### Using the Mobile Device Dashboard

1. Open http://localhost:3000 in your browser
2. Navigate to the Mobile Sync tab
3. You will see four panels:
   - Server Status: Shows the status of the mobile sync server
   - Device Management: Allows you to register and manage devices
   - File Browser: Allows you to browse and select files
   - Sync Status: Shows the history of sync operations

### Registering a Device

1. In the Device Management panel, select a device type (iPhone, iPad, Apple Watch)
2. Enter a name for the device
3. Optionally, enter a device ID (one will be generated if not provided)
4. Click "Register Device"
5. The device will appear in the list of registered devices

### Sending Heartbeats

1. For each registered device, you can click the "Send Heartbeat" button to simulate a heartbeat
2. This will update the "Last Seen" timestamp for the device

### Browsing Files

1. In the File Browser panel, select a device type to browse files for
2. Navigate through directories by clicking on them
3. Click "Up" to navigate to the parent directory
4. Click "Refresh" to reload the current directory

### Syncing Files

1. In the File Browser panel, select a file by clicking the "Select" button
2. The selected file will appear in the Sync Operations section
3. Click "Sync File" to sync the file between the server and the device

## Programmatic Usage

You can also use the `MobileDeviceTester` class to programmatically interact with the Mobile Sync Server:

```javascript
const MobileDeviceTester = require('./src/MobileDeviceTester');

async function example() {
  // Create a new tester for iPhone
  const tester = new MobileDeviceTester();
  
  // Check server status
  const status = await tester.getStatus('iPhone');
  console.log('Server status:', status);
  
  // Generate and register a mock device
  const mockDevice = tester.generateMockDevice('iPhone');
  await tester.registerDevice(mockDevice);
  
  // Send a heartbeat
  await tester.sendHeartbeat(mockDevice.deviceId, 'iPhone');
  
  // List files
  const files = await tester.listFiles('', 'iPhone');
  console.log('Files:', files);
  
  // Sync a file
  if (files.files?.length > 0) {
    const testFile = files.files[0].path;
    await tester.syncFile(testFile, 'Test content', mockDevice.deviceId, 'iPhone');
  }
}
```

See the `examples/mobile-device-test.js` file for a complete example.

## Mobile Sync Server API

The Mobile Sync Server exposes the following endpoints:

### Status Endpoint

- `GET /api/status`: Get the status of the server

### Device Endpoints

- `POST /api/devices/register`: Register a new device
- `POST /api/devices/heartbeat`: Send a heartbeat for a device

### File Endpoints

- `GET /api/files/:path?`: List files at a specific path
- `POST /api/files/:path`: Sync a file at a specific path

## Configuration

The Mobile Sync Server and MobileDeviceTester can be configured using the `src/config/mobile-testing.js` file, which contains settings for:

- Server ports for different device types
- Test device templates
- Test file paths
- Sync delay ranges
- Logging configuration

## Troubleshooting

- If the Mobile Sync Server is not responding, check the logs in the `logs` directory
- Make sure all the required ports (3001, 3002, 3003) are available
- If you can't connect to the server, make sure Node.js is installed and the server is running
- Check the browser console for errors when using the Mobile Device Dashboard
