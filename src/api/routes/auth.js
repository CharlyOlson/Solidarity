/**
 * Authentication Routes
 * Re-exports the authRouter from the auth middleware module
 */

const { authRouter } = require('../middleware/auth');

module.exports = authRouter;
