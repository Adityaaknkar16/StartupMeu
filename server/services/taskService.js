const Task = require('../models/Task');
const activityService = require('./activityService');
const MESSAGES = require('../utils/messages');

const taskService = {
  /**
   * Create a new task within a project
   */
  async createTask(projectId, userId, taskData) {
    // If order is not specified, place at the bottom of the status column
    let taskOrder = taskData.order;
    if (taskOrder === undefined) {
      const highestOrderTask = await Task.findOne({
        project: projectId,
        status: taskData.status || 'todo'
      })
        .sort({ order: -1 })
        .select('order');

      taskOrder = highestOrderTask ? highestOrderTask.order + 1 : 0;
    }

    const task = await Task.create({
      ...taskData,
      project: projectId,
      createdBy: userId,
      order: taskOrder
    });

    await activityService.logActivity({
      projectId,
      userId,
      action: 'created_task',
      taskTitle: task.title,
      details: { status: task.status, priority: task.priority }
    });

    return Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');
  },

  /**
   * Query tasks with filtering, search, pagination, and sorting
   */
  async getTasks(projectId, query = {}) {
    const filter = { project: projectId };

    // Status filter
    if (query.status && ['todo', 'in-progress', 'done'].includes(query.status)) {
      filter.status = query.status;
    }

    // Priority filter
    if (query.priority && ['low', 'medium', 'high'].includes(query.priority)) {
      filter.priority = query.priority;
    }

    // Assignee filter
    if (query.assignee) {
      if (query.assignee === 'unassigned') {
        filter.assignee = null;
      } else {
        filter.assignee = query.assignee;
      }
    }

    // Search filter (text in title or description)
    if (query.search && query.search.trim() !== '') {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Pagination
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 100)); // Default 100 for Kanban cards
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = query.sortBy || 'order';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder, createdAt: -1 };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('assignee', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .lean(),
      Task.countDocuments(filter)
    ]);

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Update task fields
   */
  async updateTask(taskId, projectId, userId, updateData) {
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      const error = new Error(MESSAGES.TASK.NOT_FOUND);
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    const previousStatus = task.status;

    // Update allowable fields
    if (updateData.title !== undefined) task.title = updateData.title;
    if (updateData.description !== undefined) task.description = updateData.description;
    if (updateData.status !== undefined) task.status = updateData.status;
    if (updateData.priority !== undefined) task.priority = updateData.priority;
    if (updateData.assignee !== undefined) task.assignee = updateData.assignee || null;
    if (updateData.dueDate !== undefined) task.dueDate = updateData.dueDate || null;
    if (updateData.order !== undefined) task.order = updateData.order;
    if (updateData.estimatedHours !== undefined) task.estimatedHours = updateData.estimatedHours;
    if (updateData.subtasks !== undefined) task.subtasks = updateData.subtasks;

    await task.save();

    const action = updateData.status && updateData.status !== previousStatus ? 'moved_task' : 'updated_task';

    await activityService.logActivity({
      projectId,
      userId,
      action,
      taskTitle: task.title,
      details: {
        previousStatus,
        newStatus: task.status,
        priority: task.priority
      }
    });

    return Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');
  },

  /**
   * Move task across status columns and/or reorder (optimistic updates support)
   */
  async moveTask(taskId, projectId, userId, { status, order = 0 }) {
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      const error = new Error(MESSAGES.TASK.NOT_FOUND);
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    const previousStatus = task.status;
    task.status = status;
    task.order = order;
    await task.save();

    await activityService.logActivity({
      projectId,
      userId,
      action: 'moved_task',
      taskTitle: task.title,
      details: {
        from: previousStatus,
        to: status,
        order
      }
    });

    return Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');
  },

  /**
   * Delete task
   */
  async deleteTask(taskId, projectId, userId) {
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      const error = new Error(MESSAGES.TASK.NOT_FOUND);
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    const taskTitle = task.title;
    await Task.findByIdAndDelete(taskId);

    await activityService.logActivity({
      projectId,
      userId,
      action: 'deleted_task',
      taskTitle,
      details: { status: task.status }
    });

    return { deletedTaskId: taskId, title: taskTitle };
  }
};

module.exports = taskService;
