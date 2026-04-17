/**
 * Global Error Handler Middleware
 * Catches unhandled errors and returns consistent error responses
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
