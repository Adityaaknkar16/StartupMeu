const Project = require('../models/Project');
const MESSAGES = require('../utils/messages');
const { sendError } = require('../utils/apiResponse');

/**
 * Validates that the requested project exists and the current authenticated user is a member (or owner).
 * Attaches the found project document to req.project.
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return sendError(
        res,
        'Project ID is required',
        'MISSING_PROJECT_ID',
        [],
        400
      );
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(
        res,
        MESSAGES.PROJECT.NOT_FOUND,
        'PROJECT_NOT_FOUND',
        [],
        404
      );
    }

    if (!project.isMember(req.user._id)) {
      return sendError(
        res,
        MESSAGES.PROJECT.NOT_MEMBER,
        'FORBIDDEN',
        [],
        403
      );
    }

    req.project = project;
    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(
        res,
        MESSAGES.PROJECT.NOT_FOUND,
        'INVALID_PROJECT_ID',
        [],
        404
      );
    }
    return sendError(
      res,
      MESSAGES.SYSTEM.INTERNAL_ERROR,
      'SERVER_ERROR',
      [{ message: error.message }],
      500
    );
  }
};

/**
 * Validates that the current authenticated user is the owner of the project.
 * Must be used in conjunction with or after requireProjectMember, or resolves project if not yet attached.
 */
const requireProjectOwner = async (req, res, next) => {
  try {
    let project = req.project;

    if (!project) {
      const projectId = req.params.projectId || req.params.id;
      if (!projectId) {
        return sendError(
          res,
          'Project ID is required',
          'MISSING_PROJECT_ID',
          [],
          400
        );
      }

      project = await Project.findById(projectId);
      if (!project) {
        return sendError(
          res,
          MESSAGES.PROJECT.NOT_FOUND,
          'PROJECT_NOT_FOUND',
          [],
          404
        );
      }
      req.project = project;
    }

    if (!project.isOwner(req.user._id)) {
      return sendError(
        res,
        MESSAGES.PROJECT.ONLY_OWNER_ALLOWED,
        'FORBIDDEN',
        [],
        403
      );
    }

    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(
        res,
        MESSAGES.PROJECT.NOT_FOUND,
        'INVALID_PROJECT_ID',
        [],
        404
      );
    }
    return sendError(
      res,
      MESSAGES.SYSTEM.INTERNAL_ERROR,
      'SERVER_ERROR',
      [{ message: error.message }],
      500
    );
  }
};

/**
 * Validates that the requested task exists and the user is a member of the parent project.
 * Attaches req.task and req.project.
 */
const requireTaskAccess = async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    const taskId = req.params.taskId || req.params.id;

    if (!taskId) {
      return sendError(
        res,
        'Task ID is required',
        'MISSING_TASK_ID',
        [],
        400
      );
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return sendError(
        res,
        MESSAGES.TASK.NOT_FOUND,
        'NOT_FOUND',
        [],
        404
      );
    }

    const project = await Project.findById(task.project);
    if (!project || !project.isMember(req.user._id)) {
      return sendError(
        res,
        MESSAGES.PROJECT.NOT_MEMBER,
        'FORBIDDEN',
        [],
        403
      );
    }

    req.task = task;
    req.project = project;
    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(
        res,
        MESSAGES.TASK.NOT_FOUND,
        'NOT_FOUND',
        [],
        404
      );
    }
    return sendError(
      res,
      MESSAGES.SYSTEM.INTERNAL_ERROR,
      'SERVER_ERROR',
      [{ message: error.message }],
      500
    );
  }
};

module.exports = {
  requireProjectMember,
  requireProjectOwner,
  requireTaskAccess
};

