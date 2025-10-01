# Solidarity Testing Interface

This project provides a comprehensive testing interface for the Solidarity system, allowing users to interact with system components through a clean, modern dashboard.

## Overview

The testing interface consists of:

1. **Backend Test Server**: A Node.js/Express server that simulates the Solidarity system API responses
2. **React Frontend**: A React application that provides a user interface for testing different aspects of the Solidarity system

## Requirements

- Node.js (v14+)
- NPM (v6+)
- Modern web browser

## Project Structure

```
Solidarity/
  ├── frontend/                 # React frontend application
  │   ├── public/               # Static assets
  │   ├── src/                  # Source code
  │   │   ├── api/              # API client for backend communication
  │   │   ├── components/       # React components
  │   │   └── App.js            # Main application component
  │   ├── package.json          # Frontend dependencies
  │   └── README.md             # Frontend documentation
  ├── backend-test-server.js    # Express server for API simulation
  └── README.md                 # Project documentation
```

## Setup & Installation

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Install Backend Dependencies

```bash
npm install express cors body-parser
```

## Running the Application

### 1. Start the Backend Test Server

```bash
node backend-test-server.js
```

The server will start on port 3000 by default.

### 2. Start the Mobile Sync Server

```bash
node mobile-sync-server.js
```

The mobile sync server will start on the following ports:
- iPhone: port 3001
- iPad: port 3002
- Apple Watch: port 3003

### 3. Start the React Frontend

```bash
cd frontend
npm start
```

The frontend development server will start on port 3000 by default.

## Testing Features

The testing interface provides the following tabs for testing different aspects of the Solidarity system:

### System Status Tab

- View the current status of the Solidarity system
- Check version information
- Monitor system metrics

### Discovery Tab

- Discover Solidarity installations on the local network and other locations
- View installation details including file counts and modification dates
- See connected devices

### Audio Tab

- Execute audio processing commands
- View command outputs and performance metrics
- Test different audio processing algorithms

### Devices Tab

- View and manage connected devices
- Monitor device status and connectivity
- Perform device-specific actions

### Mobile Sync Tab

- Interact with the mobile sync server
- Register and manage mobile devices (iPhone, iPad, Apple Watch)
- Browse files on connected devices
- Monitor sync status and errors
- Send heartbeat signals to keep devices connected

## Development Notes

### Backend Test Server

The backend test server (`backend-test-server.js`) simulates the behavior of the Solidarity system API. It provides endpoints for:

- System status information
- Discovery operations
- Audio command execution
- Device management

All responses are simulated and do not require an actual Solidarity system installation.

### Mobile Sync Server

The mobile sync server (`mobile-sync-server.js`) provides a simulated interface for mobile device synchronization. It offers endpoints for:

- Device registration and heartbeats
- File browsing and synchronization
- Sync status monitoring

The server runs on multiple ports to simulate different device types (iPhone, iPad, Apple Watch).

### API Client

The API client (`frontend/src/api/client.js`) provides methods for communicating with the backend server. It handles HTTP requests and response parsing.

### Frontend Components

The React frontend is organized into components that correspond to different system functionalities:

- `SystemStatusTab.js`: Displays system status information
- `DiscoveryTab.js`: Handles discovery operations
- `AudioTab.js`: Provides an interface for executing audio commands
- `DevicesTab.js`: Manages connected devices
- `MobileDeviceDashboard.js`: Interface for mobile device sync operations

## Extending the Testing Interface

To add new functionality:

1. Add new endpoints to the backend test server
2. Update the API client with methods for the new endpoints
3. Create new React components or enhance existing ones
4. Update the main App.js to incorporate the new components

## Troubleshooting

- **Backend Connection Issues**: Ensure the backend server is running on port 3000
- **Mobile Sync Connection Issues**: Ensure the mobile sync server is running on ports 3001-3003
- **Frontend Build Errors**: Check console for detailed error messages
- **CORS Errors**: The backend server includes CORS headers to allow cross-origin requests
