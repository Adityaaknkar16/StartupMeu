const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { requireTaskAccess } = require('../middleware/projectAccess');
const validate = require('../middleware/validate');
const { updateTaskSchema, moveTaskSchema } = require('../middleware/schemas');

const router = express.Router();

// Direct task operations require valid session and membership in parent project
router.use(authenticate);
router.use('/:id', requireTaskAccess);

// Update task details
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);

// Move task (status transition and/or column reordering)
router.patch('/:id/move', validate(moveTaskSchema), taskController.moveTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
