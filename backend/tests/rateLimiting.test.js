const mongoose = require('mongoose');
const request = require('supertest');

describe('Rate Limiting', () => {
  let app;

  beforeAll(async () => {
    jest.resetModules();
    app = require('../app');
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('admin login blocks after 5 rapid attempts', async () => {
    const attempts = [];
    for (let i = 0; i < 6; i++) {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' });
      attempts.push(res.status);
    }
    expect(attempts[5]).toBe(429);
  });
});

describe('User Login Rate Limiting', () => {
  let app;

  beforeAll(async () => {
    jest.resetModules();
    app = require('../app');
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('user login blocks after 10 rapid attempts', async () => {
    const attempts = [];
    for (let i = 0; i < 11; i++) {
      const res = await request(app)
        .post('/api/login')
        .send({ emailOrPhone: 'nobody@test.com', password: 'wrong' });
      attempts.push(res.status);
    }
    expect(attempts[10]).toBe(429);
  });
});

describe('Password Reset Rate Limiting', () => {
  let app;

  beforeAll(async () => {
    jest.resetModules();
    app = require('../app');
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('password reset blocks after 3 rapid attempts', async () => {
    const attempts = [];
    for (let i = 0; i < 4; i++) {
      const res = await request(app).post('/api/request-reset').send({ email: 'nobody@test.com' });
      attempts.push(res.status);
    }
    expect(attempts[3]).toBe(429);
  });
});
