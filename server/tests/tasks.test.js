const request = require('supertest');
const app = require('../app');
const MESSAGES = require('../utils/messages');

describe('Task CRUD, Filtering, Pagination & Move API (/api/tasks & /api/projects/:id/tasks)', () => {
  let ownerToken;
  let outsiderToken;
  let projectId;

  beforeEach(async () => {
    // Register owner
    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Task Owner',
      email: 'taskowner@flowdeck.test',
      password: 'Password123!'
    });
    ownerToken = ownerRes.body.data.token;

    // Register outsider
    const outsiderRes = await request(app).post('/api/auth/register').send({
      name: 'Task Outsider',
      email: 'taskoutsider@flowdeck.test',
      password: 'Password123!'
    });
    outsiderToken = outsiderRes.body.data.token;

    // Create Project
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Task Board Test Project' });
    projectId = projectRes.body.data.project._id;
  });

  describe('Task Creation', () => {
    it('should create a task inside the project successfully', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Implement Redis Caching',
          description: 'Cache board queries for 60 seconds',
          status: 'todo',
          priority: 'high'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.TASK.CREATE_SUCCESS);
      expect(res.body.data.task.title).toBe('Implement Redis Caching');
      expect(res.body.data.task.status).toBe('todo');
      expect(res.body.data.task.priority).toBe('high');
    });

    it('should create task with subtasks checklist', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Full Stack Integration',
          subtasks: [
            { title: 'Write tests', completed: true },
            { title: 'Deploy staging', completed: false }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.task.subtasks.length).toBe(2);
      expect(res.body.data.task.subtasks[0].completed).toBe(true);
    });

    it('should reject task creation from an unauthorized outsider', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ title: 'Hacked Task' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.PROJECT.NOT_MEMBER);
    });

    it('should fail when title is missing or empty', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: '', status: 'todo' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Task Filtering, Search & Pagination', () => {
    beforeEach(async () => {
      // Seed 4 test tasks
      await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Design Figma layout', status: 'todo', priority: 'low' });

      await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Build React components', status: 'in-progress', priority: 'high' });

      await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Write Jest test suites', status: 'in-progress', priority: 'medium' });

      await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Deploy on Cloud Run', status: 'done', priority: 'high' });
    });

    it('should filter tasks by status=in-progress', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?status=in-progress`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks.length).toBe(2);
      expect(res.body.data.tasks.every((t) => t.status === 'in-progress')).toBe(true);
    });

    it('should filter tasks by priority=high', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?priority=high`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks.length).toBe(2);
      expect(res.body.data.tasks.every((t) => t.priority === 'high')).toBe(true);
    });

    it('should search tasks by title keyword', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?search=Jest`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].title).toContain('Jest');
    });

    it('should paginate results properly with page and limit params', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?page=1&limit=2`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.tasks.length).toBe(2);
      expect(res.body.data.pagination.total).toBe(4);
      expect(res.body.data.pagination.totalPages).toBe(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
    });
  });

  describe('Task Move & Mutation Operations', () => {
    let taskId;

    beforeEach(async () => {
      const taskRes = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Drag and Drop Card',
          status: 'todo',
          priority: 'medium',
          order: 0
        });
      taskId = taskRes.body.data.task._id;
    });

    it('should move task to new status column with optimistic response message', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/move`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          status: 'in-progress',
          order: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.TASK.MOVE_SUCCESS('In Progress'));
      expect(res.body.data.task.status).toBe('in-progress');
      expect(res.body.data.task.order).toBe(1);
    });

    it('should forbid unauthorized outsider from moving a task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/move`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ status: 'done', order: 0 });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.PROJECT.NOT_MEMBER);
    });

    it('should update task details successfully', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Updated Card Title',
          priority: 'high'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.TASK.UPDATE_SUCCESS);
      expect(res.body.data.task.title).toBe('Updated Card Title');
      expect(res.body.data.task.priority).toBe('high');
    });

    it('should delete task successfully', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.TASK.DELETE_SUCCESS);
      expect(res.body.data.deletedTaskId).toBe(taskId);
    });
  });
});
