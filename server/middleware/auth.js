const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MESSAGES = require('../utils/messages');
const { sendError } = require('../utils/apiResponse');

/**
 * Authentication Middleware
 * Validates the JWT Bearer token from the Authorization header.
 * Attaches the authenticated user object to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(
        res,
        MESSAGES.AUTH.UNAUTHORIZED,
        'UNAUTHORIZED',
        [{ field: 'authorization', message: MESSAGES.AUTH.UNAUTHORIZED }],
        401
      );
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'flowdeck_super_secure_jwt_secret_key_2026_dev_replace_in_prod';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(
          res,
          MESSAGES.AUTH.SESSION_EXPIRED,
          'TOKEN_EXPIRED',
          [{ field: 'token', message: MESSAGES.AUTH.SESSION_EXPIRED }],
          401
        );
      }
      return sendError(
        res,
        MESSAGES.AUTH.UNAUTHORIZED,
        'INVALID_TOKEN',
        [{ field: 'token', message: 'Token is invalid' }],
        401
      );
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return sendError(
        res,
        MESSAGES.AUTH.USER_NOT_FOUND,
        'USER_NOT_FOUND',
        [],
        401
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(
      res,
      MESSAGES.SYSTEM.SERVER_ERROR,
      'AUTH_ERROR',
      [{ message: error.message }],
      500
    );
  }
};

module.exports = {
  authenticate
};
