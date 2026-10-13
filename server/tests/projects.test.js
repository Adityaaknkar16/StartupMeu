const request = require('supertest');
const app = require('../app');
const MESSAGES = require('../utils/messages');

describe('Project & Access Control API (/api/projects)', () => {
  let ownerToken;
  let memberToken;
  let outsiderToken;
  let ownerUser;
  let memberUser;
  let outsiderUser;

  beforeEach(async () => {
    // Create Owner
    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Owner User',
      email: 'owner@flowdeck.test',
      password: 'Password123!'
    });
    ownerToken = ownerRes.body.data.token;
    ownerUser = ownerRes.body.data.user;

    // Create Member
    const memberRes = await request(app).post('/api/auth/register').send({
      name: 'Member User',
      email: 'member@flowdeck.test',
      password: 'Password123!'
    });
    memberToken = memberRes.body.data.token;
    memberUser = memberRes.body.data.user;

    // Create Outsider
    const outsiderRes = await request(app).post('/api/auth/register').send({
      name: 'Outsider User',
      email: 'outsider@flowdeck.test',
      password: 'Password123!'
    });
    outsiderToken = outsiderRes.body.data.token;
    outsiderUser = outsiderRes.body.data.user;
  });

  describe('Project Creation & Retrieval', () => {
    it('should create a new project and assign creator as owner', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Mobile Core V2',
          description: 'Next gen mobile frontend'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.PROJECT.CREATE_SUCCESS);
      expect(res.body.data.project.name).toBe('Mobile Core V2');
      expect(res.body.data.project.owner._id).toBe(ownerUser._id);
    });

    it('should list projects that user owns or is a member of', async () => {
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Project A' });

      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projects.length).toBe(1);
    });
  });

  describe('Access Control: Non-Member Restrictions', () => {
    let projectId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Secret Architecture Project' });
      projectId = createRes.body.data.project._id;
    });

    it('should forbid an outsider from reading a project they are not part of', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.PROJECT.NOT_MEMBER);
    });

    it('should permit an authorized member to access the project', async () => {
      // Invite member
      await request(app)
        .post(`/api/projects/${projectId}/invite`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: memberUser.email });

      // Member accesses project
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project._id).toBe(projectId);
    });
  });

  describe('Owner Privileges: Inviting & Deleting', () => {
    let projectId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Leadership Project' });
      projectId = createRes.body.data.project._id;

      // Add memberUser as a team member
      await request(app)
        .post(`/api/projects/${projectId}/invite`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: memberUser.email });
    });

    it('should successfully invite a valid user by email', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/invite`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: outsiderUser.email });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.MEMBER.INVITE_SUCCESS);
      expect(res.body.data.project.members.some((m) => m.user._id === outsiderUser._id)).toBe(true);
    });

    it('should fail when inviting a non-existent email', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/invite`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'ghost@donotexist.com' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.MEMBER.USER_NOT_FOUND);
    });

    it('should fail when inviting a user who is already a member', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/invite`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: memberUser.email });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.MEMBER.ALREADY_MEMBER);
    });

    it('should forbid non-owner members from inviting other users', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/invite`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ email: outsiderUser.email });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.PROJECT.ONLY_OWNER_ALLOWED);
    });

    it('should forbid non-owner members from deleting the project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.PROJECT.ONLY_OWNER_ALLOWED);
    });

    it('should allow project owner to delete the project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.PROJECT.DELETE_SUCCESS);
    });
  });
});
