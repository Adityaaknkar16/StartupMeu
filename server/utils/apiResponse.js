/**
 * Standard API Response Formatters for FlowDeck
 * Ensures 100% consistent payload structure across all endpoints.
 *
 * Success: { success: true, message: "...", data: { ... } }
 * Failure: { success: false, message: "...", code: "ERROR_CODE", errors: [ ... ] }
 */

const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message, code = 'ERROR', errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError
};
