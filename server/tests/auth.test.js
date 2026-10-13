const request = require('supertest');
const app = require('../app');
const MESSAGES = require('../utils/messages');

describe('Auth API Endpoints (/api/auth)', () => {
  const testUser = {
    name: 'Sarah Connor',
    email: 'sarah@skynet.test',
    password: 'Password123!'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with standard success response', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.AUTH.REGISTER_SUCCESS);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should fail when email is already registered with duplicate email error', async () => {
      // First registration
      await request(app).post('/api/auth/register').send(testUser);

      // Attempt duplicate registration
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED);
      expect(res.body.code).toBe('EMAIL_EXISTS');
      expect(res.body.errors[0].field).toBe('email');
    });

    it('should fail when password is less than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Password User',
          email: 'short@test.com',
          password: 'short'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.AUTH.PASSWORD_MIN_LENGTH);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
    });

    it('should fail when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Email',
          email: 'not-an-email',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should log in successfully and return personalized welcome message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.AUTH.LOGIN_SUCCESS(testUser.name));
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it('should fail login when password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword999!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.AUTH.INVALID_CREDENTIALS);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail login when email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ghost@nowhere.test',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.AUTH.INVALID_CREDENTIALS);
    });
  });

  describe('GET /api/auth/me & POST /api/auth/logout', () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(app).post('/api/auth/register').send(testUser);
      token = registerRes.body.data.token;
    });

    it('should fetch current authenticated profile when valid Bearer token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.name).toBe(testUser.name);
    });

    it('should reject profile access without Authorization header', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(MESSAGES.AUTH.UNAUTHORIZED);
    });

    it('should return safe sign out message on logout', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(MESSAGES.AUTH.LOGOUT_SUCCESS);
    });
  });
});
