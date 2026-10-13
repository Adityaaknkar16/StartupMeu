const Activity = require('../models/Activity');

/**
 * Service to record and query project timeline activities
 */
const activityService = {
  /**
   * Log an activity action
   */
  async logActivity({ projectId, userId, action, taskTitle = '', details = {} }) {
    try {
      const activity = await Activity.create({
        project: projectId,
        user: userId,
        action,
        taskTitle,
        details
      });
      return activity;
    } catch (error) {
      // Activity logging should not fail the primary business operation
      console.error('[Activity Logging Failed]', error.message);
      return null;
    }
  },

  /**
   * Get recent activities for a project with populated user details
   */
  async getProjectActivities(projectId, limit = 25) {
    return Activity.find({ project: projectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email avatar')
      .lean();
  }
};

module.exports = activityService;
