const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const activityService = require('./activityService');
const MESSAGES = require('../utils/messages');

const projectService = {
  /**
   * Create a new project with the creator as owner and first member
   */
  async createProject(userId, { name, description }) {
    const project = await Project.create({
      name,
      description,
      owner: userId,
      members: [
        {
          user: userId,
          role: 'owner',
          joinedAt: new Date()
        }
      ]
    });

    await activityService.logActivity({
      projectId: project._id,
      userId,
      action: 'created_project',
      details: { projectName: project.name }
    });

    return Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
  },

  /**
   * Fetch all projects where the user is an owner or member
   */
  async getUserProjects(userId) {
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    })
      .sort({ updatedAt: -1 })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .lean();

    return projects;
  },

  /**
   * Get single project by ID with members populated
   */
  async getProjectById(projectId) {
    const project = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      const error = new Error(MESSAGES.PROJECT.NOT_FOUND);
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    return project;
  },

  /**
   * Update project details (owner only)
   */
  async updateProject(projectId, userId, updateData) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error(MESSAGES.PROJECT.NOT_FOUND);
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    if (!project.isOwner(userId)) {
      const error = new Error(MESSAGES.PROJECT.ONLY_OWNER_ALLOWED);
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (updateData.name !== undefined) project.name = updateData.name;
    if (updateData.description !== undefined) project.description = updateData.description;

    await project.save();

    await activityService.logActivity({
      projectId: project._id,
      userId,
      action: 'updated_project',
      details: { updateData }
    });

    return Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
  },

  /**
   * Delete project and associated tasks & activities (owner only)
   */
  async deleteProject(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error(MESSAGES.PROJECT.NOT_FOUND);
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    if (!project.isOwner(userId)) {
      const error = new Error(MESSAGES.PROJECT.ONLY_OWNER_ALLOWED);
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Cascade delete project's tasks and activities
    await Task.deleteMany({ project: projectId });
    await Activity.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);

    return { deletedProjectId: projectId };
  },

  /**
   * Invite member by email (owner only)
   */
  async inviteMember(projectId, ownerId, { email, role = 'member' }) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error(MESSAGES.PROJECT.NOT_FOUND);
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    if (!project.isOwner(ownerId)) {
      const error = new Error(MESSAGES.PROJECT.ONLY_OWNER_ALLOWED);
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const targetUser = await User.findOne({ email: normalizedEmail });
    if (!targetUser) {
      const error = new Error(MESSAGES.MEMBER.USER_NOT_FOUND);
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      error.field = 'email';
      throw error;
    }

    if (project.isMember(targetUser._id)) {
      const error = new Error(MESSAGES.MEMBER.ALREADY_MEMBER);
      error.statusCode = 409;
      error.code = 'ALREADY_MEMBER';
      error.field = 'email';
      throw error;
    }

    project.members.push({
      user: targetUser._id,
      role,
      joinedAt: new Date()
    });

    await project.save();

    await activityService.logActivity({
      projectId: project._id,
      userId: ownerId,
      action: 'invited_member',
      details: { invitedUser: targetUser.name, role }
    });

    return Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
  },

  /**
   * Aggregation Endpoint: GET /projects/:id/stats
   * Aggregates tasks per status, overdue tasks count, and completion rate percentage.
   */
  async getProjectStats(projectId) {
    const projectObjId = new mongoose.Types.ObjectId(projectId);

    // MongoDB Aggregation Pipeline using $facet for single-trip execution
    const statsResult = await Task.aggregate([
      { $match: { project: projectObjId } },
      {
        $facet: {
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          priorityBreakdown: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ],
          metrics: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
                },
                overdue: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$status', 'done'] },
                          { $ne: ['$dueDate', null] },
                          { $lt: ['$dueDate', '$$NOW'] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    const result = statsResult[0] || {};
    const metrics = result.metrics?.[0] || { total: 0, completed: 0, overdue: 0 };

    // Format status breakdown map
    const statusCounts = { todo: 0, 'in-progress': 0, done: 0 };
    (result.statusBreakdown || []).forEach((item) => {
      if (item._id) statusCounts[item._id] = item.count;
    });

    // Format priority breakdown map
    const priorityCounts = { low: 0, medium: 0, high: 0 };
    (result.priorityBreakdown || []).forEach((item) => {
      if (item._id) priorityCounts[item._id] = item.count;
    });

    const totalTasks = metrics.total;
    const completedTasks = metrics.completed;
    const overdueCount = metrics.overdue;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

    return {
      projectId,
      totalTasks,
      completedTasks,
      overdueCount,
      completionRate,
      statusCounts,
      priorityCounts
    };
  },

  /**
   * Export all tasks for project reporting/standups
   */
  async exportProjectTasks(projectId) {
    const tasks = await Task.find({ project: projectId })
      .sort({ status: 1, order: 1 })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    return tasks.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      assignee: t.assignee?.name || 'Unassigned',
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
      subtasksCompleted: (t.subtasks || []).filter((s) => s.completed).length,
      subtasksTotal: (t.subtasks || []).length,
      createdAt: t.createdAt
    }));
  }
};

module.exports = projectService;
