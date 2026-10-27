const mongoose = require('mongoose');
const request = require('supertest');
const { loginAdmin } = require('./helpers/loginHelper');

let app;

beforeAll(async () => {
  app = require('../app');
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Security Middleware', () => {
  test('mongoSanitize strips $ operators from body', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ emailOrPhone: 'test@test.com', password: { $ne: '' } });
    expect(res.status).not.toBe(500);
  });

  test('helmet sets security headers', async () => {
    const res = await request(app).get('/api/meta');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });
});

describe('User Mass Assignment Protection', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        fullName: 'Security Test',
        email: 'massassign@test.com',
        phone: '01711111111',
        password: 'TestPass123!',
        address: 'Test Address',
        rewardPoints: 999999,
        accountDeletion: { requested: true },
      });
    userToken = res.body.token;
    userId = res.body.user?._id;
  });

  test('registration ignores rewardPoints and accountDeletion', async () => {
    const UserModel = require('../models/UserModel');
    const user = await UserModel.findById(userId).lean();
    expect(user.rewardPoints).toBe(0);
    expect(user.accountDeletion.requested).toBe(false);
  });

  test('update ignores rewardPoints and password via service', async () => {
    const UserModel = require('../models/UserModel');
    const UserService = require('../services/UserService');

    await UserService.updateUser(userId, {
      fullName: 'Updated Name',
      rewardPoints: 50000,
      password: 'hacked123',
    });

    const user = await UserModel.findById(userId).select('+password').lean();
    expect(user.fullName).toBe('Updated Name');
    expect(user.rewardPoints).toBe(0);
    const bcrypt = require('bcryptjs');
    const isHacked = await bcrypt.compare('hacked123', user.password);
    expect(isHacked).toBe(false);
    const isOriginal = await bcrypt.compare('TestPass123!', user.password);
    expect(isOriginal).toBe(true);
  });
});

describe('Admin Mass Assignment Protection', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAdmin(app);
  });

  test('admin creation only accepts whitelisted fields', async () => {
    const res = await request(app)
      .post('/api/admin/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Admin',
        email: 'newadmin@test.com',
        mobileNo: '01733333333',
        password: 'newadmin123',
        permissions: ['general_info', 'setup_config'],
        __v: 999,
      });
    expect(res.status).toBe(201);
    const AdminModel = require('../models/AdminModel');
    const admin = await AdminModel.findById(res.body.admin._id).lean();
    expect(admin.name).toBe('New Admin');
    expect(admin.permissions).toEqual(['general_info', 'setup_config']);
  });
});

describe('Password Reset Security', () => {
  let user;

  beforeAll(async () => {
    const UserModel = require('../models/UserModel');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('oldpass', salt);

    user = await UserModel.create({
      fullName: 'Reset User',
      email: 'resetuser@test.com',
      phone: '01744444444',
      password: hashed,
      address: 'Test',
    });
  });

  test('OTP is generated and stored correctly', async () => {
    const res = await request(app).post('/api/request-reset').send({ email: 'resetuser@test.com' });
    expect(res.status).toBe(200);

    const UserModel = require('../models/UserModel');
    const storedUser = await UserModel.findById(user._id)
      .select('+resetOTP +resetOTPExpiry')
      .lean();
    expect(storedUser.resetOTP).toBeDefined();
    expect(typeof storedUser.resetOTP).toBe('number');
    expect(storedUser.resetOTP).toBeGreaterThan(99999);
    expect(storedUser.resetOTP).toBeLessThan(1000000);
  });

  test('OTP is verified correctly - wrong OTP rejected', async () => {
    const res = await request(app)
      .post('/api/reset-password')
      .send({ email: 'resetuser@test.com', otp: 111111, newPassword: 'newpass123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid OTP');
  });
});

describe('Payment Config Secrets Hidden', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAdmin(app);

    const BkashConfig = require('../models/BkashConfigModel');
    await BkashConfig.create({
      baseUrl: 'https://example.com',
      appKey: 'test-app-key',
      appSecret: 'secret-should-not-appear',
      username: 'test-user',
      password: 'pass-should-not-appear',
      isActive: true,
    });
  });

  test('bkash config does not expose appSecret or password', async () => {
    const res = await request(app)
      .get('/api/bkash-config')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.appSecret).toBeUndefined();
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.appKey).toBeDefined();
  });
});

describe('NoSQL Injection Prevention', () => {
  test('$ne operator is sanitized from login body (does not authenticate)', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ emailOrPhone: { $ne: '' }, password: { $ne: '' } });
    expect(res.status).not.toBe(200);
  });

  test('$gt operator does not crash product route', async () => {
    const res = await request(app).get('/api/products?price[$gt]=100');
    expect([200, 404]).toContain(res.status);
  });
});
