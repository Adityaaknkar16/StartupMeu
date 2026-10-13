const MESSAGES = require('../utils/messages');
const { sendError } = require('../utils/apiResponse');

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res) => {
  return sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    'ROUTE_NOT_FOUND',
    [],
    404
  );
};

/**
 * Centralized Application Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const message =
      duplicateField === 'email'
        ? MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED
        : `${duplicateField} already exists`;

    return sendError(
      res,
      message,
      'DUPLICATE_RESOURCE',
      [{ field: duplicateField, message }],
      409
    );
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));

    return sendError(
      res,
      MESSAGES.VALIDATION.FAILED,
      'VALIDATION_ERROR',
      formattedErrors,
      400
    );
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(
      res,
      `Invalid ${err.path}: ${err.value}`,
      'INVALID_IDENTIFIER',
      [{ field: err.path, message: `Invalid identifier provided for ${err.path}` }],
      400
    );
  }

  // Handle JSON parsing error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(
      res,
      'Invalid JSON in request payload',
      'MALFORMED_JSON',
      [],
      400
    );
  }

  // Handle JWT specific errors if passed to next(err)
  if (err.name === 'TokenExpiredError') {
    return sendError(
      res,
      MESSAGES.AUTH.SESSION_EXPIRED,
      'TOKEN_EXPIRED',
      [],
      401
    );
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(
      res,
      MESSAGES.AUTH.UNAUTHORIZED,
      'INVALID_TOKEN',
      [],
      401
    );
  }

  // Fallback 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? MESSAGES.SYSTEM.INTERNAL_ERROR
      : err.message || MESSAGES.SYSTEM.INTERNAL_ERROR;

  return sendError(
    res,
    message,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'development' ? [{ stack: err.stack }] : [],
    statusCode
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
