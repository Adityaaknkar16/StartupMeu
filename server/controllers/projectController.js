const projectService = require('../services/projectService');
const activityService = require('../services/activityService');
const MESSAGES = require('../utils/messages');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const projectController = {
  /**
   * Create a new project
   */
  async createProject(req, res, next) {
    try {
      const { name, description } = req.body;
      const project = await projectService.createProject(req.user._id, { name, description });

      return sendSuccess(
        res,
        MESSAGES.PROJECT.CREATE_SUCCESS,
        { project },
        201
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * List all projects the user is a member/owner of
   */
  async getUserProjects(req, res, next) {
    try {
      const projects = await projectService.getUserProjects(req.user._id);

      return sendSuccess(
        res,
        MESSAGES.PROJECT.LIST_SUCCESS,
        { projects },
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project details by ID
   */
  async getProjectById(req, res, next) {
    try {
      // req.project is already verified and attached by requireProjectMember middleware
      const project = await projectService.getProjectById(req.project._id);

      return sendSuccess(
        res,
        MESSAGES.PROJECT.FETCH_SUCCESS,
        { project },
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update project details (owner only)
   */
  async updateProject(req, res, next) {
    try {
      const { name, description } = req.body;
      const project = await projectService.updateProject(req.project._id, req.user._id, {
        name,
        description
      });

      return sendSuccess(
        res,
        MESSAGES.PROJECT.UPDATE_SUCCESS,
        { project },
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete project (owner only)
   */
  async deleteProject(req, res, next) {
    try {
      const result = await projectService.deleteProject(req.project._id, req.user._id);

      return sendSuccess(
        res,
        MESSAGES.PROJECT.DELETE_SUCCESS,
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Invite a new member to the project by email (owner only)
   */
  async inviteMember(req, res, next) {
    try {
      const { email, role } = req.body;
      const project = await projectService.inviteMember(req.project._id, req.user._id, {
        email,
        role
      });

      return sendSuccess(
        res,
        MESSAGES.MEMBER.INVITE_SUCCESS,
        { project },
        200
      );
    } catch (error) {
      if (error.code === 'USER_NOT_FOUND' || error.code === 'ALREADY_MEMBER') {
        return sendError(
          res,
          error.message,
          error.code,
          [{ field: error.field, message: error.message }],
          error.statusCode || 400
        );
      }
      next(error);
    }
  },

  /**
   * Aggregation endpoint: GET /projects/:id/stats
   */
  async getProjectStats(req, res, next) {
    try {
      const stats = await projectService.getProjectStats(req.project._id);

      return sendSuccess(
        res,
        MESSAGES.PROJECT.STATS_SUCCESS,
        stats,
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Timeline endpoint: GET /projects/:id/activities
   */
  async getProjectActivities(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 30;
      const activities = await activityService.getProjectActivities(req.project._id, limit);

      return sendSuccess(
        res,
        'Activities retrieved successfully',
        { activities },
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export endpoint: GET /projects/:id/export
   */
  async exportProject(req, res, next) {
    try {
      const exportData = await projectService.exportProjectTasks(req.project._id);

      return sendSuccess(
        res,
        'Project tasks exported successfully',
        { tasks: exportData },
        200
      );
    } catch (error) {
      next(error);
    }
  }
};

module.exports = projectController;
