const taskService = require('../services/taskService');
const MESSAGES = require('../utils/messages');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const taskController = {
  /**
   * Create a new task within a project
   */
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(
        req.project._id,
        req.user._id,
        req.body
      );

      return sendSuccess(
        res,
        MESSAGES.TASK.CREATE_SUCCESS,
        { task },
        201
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get tasks for a project with filters & pagination
   */
  async getTasks(req, res, next) {
    try {
      const result = await taskService.getTasks(req.project._id, req.query);

      return sendSuccess(
        res,
        MESSAGES.TASK.LIST_SUCCESS,
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update task details
   */
  async updateTask(req, res, next) {
    try {
      const taskId = req.params.taskId || req.params.id;
      const task = await taskService.updateTask(
        taskId,
        req.project._id,
        req.user._id,
        req.body
      );

      return sendSuccess(
        res,
        MESSAGES.TASK.UPDATE_SUCCESS,
        { task },
        200
      );
    } catch (error) {
      if (error.code === 'TASK_NOT_FOUND') {
        return sendError(
          res,
          MESSAGES.TASK.NOT_FOUND,
          'NOT_FOUND',
          [],
          404
        );
      }
      next(error);
    }
  },

  /**
   * Move task across columns or re-order
   */
  async moveTask(req, res, next) {
    try {
      const taskId = req.params.taskId || req.params.id;
      const { status, order } = req.body;

      const task = await taskService.moveTask(
        taskId,
        req.project._id,
        req.user._id,
        { status, order }
      );

      const statusLabels = {
        todo: 'To Do',
        'in-progress': 'In Progress',
        done: 'Done'
      };
      const displayStatus = statusLabels[task.status] || task.status;

      return sendSuccess(
        res,
        MESSAGES.TASK.MOVE_SUCCESS(displayStatus),
        { task },
        200
      );
    } catch (error) {
      if (error.code === 'TASK_NOT_FOUND') {
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
        MESSAGES.TASK.MOVE_FAILED,
        'MOVE_FAILED',
        [{ message: error.message }],
        400
      );
    }
  },

  /**
   * Delete task
   */
  async deleteTask(req, res, next) {
    try {
      const taskId = req.params.taskId || req.params.id;
      const result = await taskService.deleteTask(
        taskId,
        req.project._id,
        req.user._id
      );

      return sendSuccess(
        res,
        MESSAGES.TASK.DELETE_SUCCESS,
        result,
        200
      );
    } catch (error) {
      if (error.code === 'TASK_NOT_FOUND') {
        return sendError(
          res,
          MESSAGES.TASK.NOT_FOUND,
          'NOT_FOUND',
          [],
          404
        );
      }
      next(error);
    }
  }
};

module.exports = taskController;
