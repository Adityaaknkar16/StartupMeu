const express = require('express');
const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');

const router = express.Router();

// Healthcheck endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FlowDeck API is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
