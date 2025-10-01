/**
 * Mobile Device Tester Demo Script
 * 
 * This script demonstrates the usage of MobileDeviceTester class
 * to interact with the Solidarity Mobile Sync Server.
 */

const MobileDeviceTester = require('../src/MobileDeviceTester');

async function runMobileDeviceTest() {
  console.log('Starting Mobile Device Tester Demo');
  console.log('==================================\n');

  // Create an instance of MobileDeviceTester
  const tester = new MobileDeviceTester();
  console.log('Mobile Device Tester initialized with endpoints:');
  console.log('- iPhone:', tester.endpoints.iPhone);
  console.log('- iPad:', tester.endpoints.iPad);
  console.log('- Watch:', tester.endpoints.watch);
  console.log();

  // Try to get server status
  try {
    console.log('Checking iPhone server status...');
    const status = await tester.getStatus('iPhone');
    console.log('Server status:', JSON.stringify(status, null, 2));
    console.log();
  } catch (error) {
    console.error('Failed to get server status:', error.message);
    console.log('\nMake sure the mobile-sync-server.js is running before testing.');
    console.log('You can start it with: node mobile-sync-server.js');
    process.exit(1);
  }

  // Register mock devices
  console.log('Registering mock devices...');
  
  try {
    // Generate and register iPhone
    const mockIPhone = tester.generateMockDevice('iPhone');
    console.log(`Generated mock iPhone: ${mockIPhone.deviceName} (${mockIPhone.deviceId})`);
    await tester.registerDevice(mockIPhone);
    
    // Generate and register iPad
    const mockIPad = tester.generateMockDevice('iPad');
    console.log(`Generated mock iPad: ${mockIPad.deviceName} (${mockIPad.deviceId})`);
    await tester.registerDevice(mockIPad);
    
    console.log('\nRegistered devices:');
    const devices = tester.getRegisteredDevices();
    devices.forEach(device => {
      console.log(`- ${device.deviceName} (${device.deviceType}): ${device.deviceId}`);
    });
    console.log();
    
    // Send heartbeats
    console.log('Sending heartbeats...');
    await tester.sendHeartbeat(mockIPhone.deviceId, 'iPhone');
    console.log(`Heartbeat sent for ${mockIPhone.deviceName}`);
    
    await tester.sendHeartbeat(mockIPad.deviceId, 'iPad');
    console.log(`Heartbeat sent for ${mockIPad.deviceName}`);
    console.log();
    
    // List files
    console.log('Listing files in root directory...');
    const files = await tester.listFiles('', 'iPhone');
    console.log('Files:', JSON.stringify(files, null, 2));
    console.log();
    
    // Sync a test file
    const testFilePath = 'temp/mobile-test-file.txt';
    const testContent = `Test file created by Mobile Device Tester\nTimestamp: ${new Date().toISOString()}\nDevice: ${mockIPhone.deviceName}`;
    
    console.log(`Syncing test file to ${testFilePath}...`);
    const syncResult = await tester.syncFile(testFilePath, testContent, mockIPhone.deviceId, 'iPhone');
    console.log('Sync result:', syncResult);
    console.log();
    
    // Verify file was created
    console.log('Verifying file was created...');
    const verifyFile = await tester.listFiles(testFilePath, 'iPhone');
    console.log('File content:', verifyFile.content);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  
  console.log('\nMobile Device Tester Demo completed.');
}

// Run the test
runMobileDeviceTest().catch(error => {
  console.error('Fatal error:', error);
});
