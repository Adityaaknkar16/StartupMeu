const request = require('supertest');
const app = require('../app');
const MESSAGES = require('../utils/messages');

describe('Project Aggregation Stats Endpoint (GET /api/projects/:id/stats)', () => {
  let ownerToken;
  let outsiderToken;
  let projectId;

  beforeEach(async () => {
    // Owner
    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Stats Owner',
      email: 'statsowner@flowdeck.test',
      password: 'Password123!'
    });
    ownerToken = ownerRes.body.data.token;

    // Outsider
    const outsiderRes = await request(app).post('/api/auth/register').send({
      name: 'Stats Outsider',
      email: 'statsoutsider@flowdeck.test',
      password: 'Password123!'
    });
    outsiderToken = outsiderRes.body.data.token;

    // Project
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Metrics & Analytics Project' });
    projectId = projectRes.body.data.project._id;

    const now = Date.now();
    const dayMs = 86400000;

    // 1. Todo task (not overdue)
    await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Future Todo Task',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 5 * dayMs).toISOString()
      });

    // 2. In-Progress task (OVERDUE: dueDate in the past)
    await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Overdue In-Progress Task',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(now - 3 * dayMs).toISOString()
      });

    // 3. In-Progress task (not overdue)
    await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Active In-Progress Task',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(now + 2 * dayMs).toISOString()
      });

    // 4. Done task (past due date, but completed so NOT overdue!)
    await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Completed Past Task',
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 5 * dayMs).toISOString()
      });
  });

  it('should accurately calculate aggregation statistics via MongoDB $facet pipeline', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/stats`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.PROJECT.STATS_SUCCESS);

    const stats = res.body.data;
    expect(stats.totalTasks).toBe(4);
    expect(stats.completedTasks).toBe(1);
    expect(stats.overdueCount).toBe(1); // Only task #2 is overdue (task #4 is done!)
    expect(stats.completionRate).toBe(25); // 1 / 4 * 100 = 25%

    // Check status counts
    expect(stats.statusCounts.todo).toBe(1);
    expect(stats.statusCounts['in-progress']).toBe(2);
    expect(stats.statusCounts.done).toBe(1);

    // Check priority counts
    expect(stats.priorityCounts.low).toBe(1);
    expect(stats.priorityCounts.medium).toBe(1);
    expect(stats.priorityCounts.high).toBe(2);
  });

  it('should deny non-members from accessing project statistics', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/stats`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(MESSAGES.PROJECT.NOT_MEMBER);
  });
});
