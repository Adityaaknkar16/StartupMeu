const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema } = require('../middleware/schemas');

const router = express.Router();

// Public auth endpoints protected by rate limiting & validation
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected session endpoints
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
