const express = require('express');
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectOwner } = require('../middleware/projectAccess');
const validate = require('../middleware/validate');
const {
  createProjectSchema,
  updateProjectSchema,
  inviteMemberSchema,
  createTaskSchema
} = require('../middleware/schemas');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// Project Collection endpoints
router.get('/', projectController.getUserProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);

// Single Project endpoints
router.get('/:id', requireProjectMember, projectController.getProjectById);
router.put(
  '/:id',
  requireProjectMember,
  requireProjectOwner,
  validate(updateProjectSchema),
  projectController.updateProject
);
router.delete('/:id', requireProjectMember, requireProjectOwner, projectController.deleteProject);

// Project Member Invitation (Owner only)
router.post(
  '/:id/invite',
  requireProjectMember,
  requireProjectOwner,
  validate(inviteMemberSchema),
  projectController.inviteMember
);

// Project Analytics & Timeline
router.get('/:id/stats', requireProjectMember, projectController.getProjectStats);
router.get('/:id/activities', requireProjectMember, projectController.getProjectActivities);

// Project Tasks (Members can view and create tasks)
router.get('/:id/tasks', requireProjectMember, taskController.getTasks);
router.post('/:id/tasks', requireProjectMember, validate(createTaskSchema), taskController.createTask);

module.exports = router;
