const rateLimit = require('express-rate-limit');
const MESSAGES = require('../utils/messages');

/**
 * Rate Limiter for Authentication routes
 * Prevents brute-force credential stuffing and DoS attacks.
 * Max 10 requests per 15 minutes window in production.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 20, // generous in test, protective in dev/prod
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: MESSAGES.AUTH.RATE_LIMIT_EXCEEDED,
      code: 'RATE_LIMIT_EXCEEDED',
      errors: [
        {
          field: 'rateLimit',
          message: MESSAGES.AUTH.RATE_LIMIT_EXCEEDED
        }
      ]
    });
  }
});

module.exports = {
  authLimiter
};
