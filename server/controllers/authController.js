const authService = require('../services/authService');
const MESSAGES = require('../utils/messages');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const authController = {
  /**
   * Register a new user account
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register({ name, email, password });

      return sendSuccess(
        res,
        MESSAGES.AUTH.REGISTER_SUCCESS,
        result,
        201
      );
    } catch (error) {
      if (error.code === 'EMAIL_EXISTS') {
        return sendError(
          res,
          error.message,
          error.code,
          [{ field: error.field, message: error.message }],
          error.statusCode || 409
        );
      }
      next(error);
    }
  },

  /**
   * Login user with credentials
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return sendSuccess(
        res,
        MESSAGES.AUTH.LOGIN_SUCCESS(result.user.name),
        result,
        200
      );
    } catch (error) {
      if (error.code === 'INVALID_CREDENTIALS') {
        return sendError(
          res,
          error.message,
          error.code,
          [{ field: 'credentials', message: error.message }],
          error.statusCode || 401
        );
      }
      next(error);
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(req, res, next) {
    try {
      return sendSuccess(
        res,
        'Profile retrieved successfully',
        { user: req.user },
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Sign out user
   */
  async logout(req, res) {
    return sendSuccess(
      res,
      MESSAGES.AUTH.LOGOUT_SUCCESS,
      {},
      200
    );
  }
};

module.exports = authController;
