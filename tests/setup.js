// Jest global test setup for Solidarity Platform
jest.setTimeout(10000);

// Silence noisy logs during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (String(args[0] || '').includes('DeprecationWarning')) return;
  originalConsoleError(...args);
};

// Ensure environment variables are loaded if .env exists
try {
  require('dotenv').config();
} catch (_) {}
