const request = require('supertest');
const app = require('../server');
const pool = require('../db');

describe('Authentication Integration Tests', () => {
  const testUser = {
    firstName: 'Auth',
    lastName: 'Tester',
    email: 'authtest@muni.test',
    password: 'Password123!',
    phone: '+256700111222'
  };

  beforeAll(async () => {
    await pool.query('DELETE FROM users WHERE email = ?', [testUser.email]);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = ?', [testUser.email]);
    await pool.end();
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail to register an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(409);
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});