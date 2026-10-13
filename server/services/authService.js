const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MESSAGES = require('../utils/messages');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'flowdeck_super_secure_jwt_secret_key_2026_dev_replace_in_prod';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name
    },
    secret,
    { expiresIn }
  );
};

const authService = {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error(MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED);
      error.code = 'EMAIL_EXISTS';
      error.statusCode = 409;
      error.field = 'email';
      throw error;
    }

    // Hash password with salt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    const token = generateToken(user);

    return {
      user: user.toJSON(),
      token
    };
  },

  /**
   * Authenticate user with email and password
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error = new Error(MESSAGES.AUTH.INVALID_CREDENTIALS);
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error(MESSAGES.AUTH.INVALID_CREDENTIALS);
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user);

    return {
      user: user.toJSON(),
      token
    };
  },

  /**
   * Fetch current user profile
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      const error = new Error(MESSAGES.AUTH.USER_NOT_FOUND);
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  }
};

module.exports = authService;
