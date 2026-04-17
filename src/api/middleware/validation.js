/**
 * Validation Middleware
 * Request validation utilities for API endpoints
 */

const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => !req.body || req.body[field] === undefined);

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missing
      });
    }

    next();
  };
};

const validateQuery = (requiredParams) => {
  return (req, res, next) => {
    const missing = requiredParams.filter(param => !req.query || req.query[param] === undefined);

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required query parameters',
        params: missing
      });
    }

    next();
  };
};

module.exports = {
  validateBody,
  validateQuery
};
