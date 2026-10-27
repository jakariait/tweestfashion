const mongoose = require('mongoose');
const request = require('supertest');
const { loginAdmin } = require('./helpers/loginHelper');

let app;
let adminToken;

beforeAll(async () => {
  app = require('../app');
  await mongoose.connect(process.env.MONGO_URI);
  adminToken = await loginAdmin(app);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('File Upload Security', () => {
  test('rejects SVG upload', async () => {
    const res = await request(app)
      .post('/api/updateGeneralInfo')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('PrimaryLogo', Buffer.from('<svg></svg>'), 'logo.svg');
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Invalid file type/i);
  });

  test('rejects non-image file types (PDF)', async () => {
    const res = await request(app)
      .post('/api/updateGeneralInfo')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('PrimaryLogo', Buffer.from('fake-pdf-data'), 'document.pdf');
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Invalid file type/i);
  });

  test('accepts JPEG upload', async () => {
    const res = await request(app)
      .post('/api/updateGeneralInfo')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('CompanyName', 'Test Co')
      .field('PhoneNumber', '01777777777')
      .field('CompanyEmail', 'test@co.com')
      .field('CompanyAddress', 'Test Address')
      .field('ShortDescription', 'Test description')
      .field('FooterCopyright', 'Test Co')
      .attach('PrimaryLogo', Buffer.from('fake-jpeg-data'), 'logo.jpg');
    expect([200, 201]).toContain(res.status);
  });
});
