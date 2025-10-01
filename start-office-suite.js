/**
 * Office Suite Launcher
 * Simple utility to start the document management system
 */

const HiddenDocumentServer = require('./hidden-document-server.js');

console.log('📄 Starting Office Suite Document Management System...');
console.log('⚙️ Loading plugins and templates...');

// Initialize and start the "document server"
const server = new HiddenDocumentServer();
server.start().catch(error => {
  console.error('❌ Failed to start document management system:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📄 Shutting down document management system...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📄 Document management system terminated');
  process.exit(0);
});