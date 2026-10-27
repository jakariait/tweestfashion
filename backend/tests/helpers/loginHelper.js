const request = require('supertest');

async function ensureTestAdmin() {
  const AdminModel = require('../../models/AdminModel');
  const existing = await AdminModel.findOne({ email: 'testadmin@test.com' });
  if (existing) return;
  await AdminModel.create({
    name: 'Test Admin',
    email: 'testadmin@test.com',
    mobileNo: '01700000001',
    password: 'adminpass123',
    permissions: [
      'general_info',
      'view_orders',
      'add_products',
      'bkash_api',
      'steadfast_api',
      'pathao_api',
      'admin-users',
      'delete_customers',
    ],
  });
}

async function loginAdmin(app) {
  await ensureTestAdmin();
  const res = await request(app)
    .post('/api/admin/login')
    .send({ email: 'testadmin@test.com', password: 'adminpass123' });
  return res.body.admin.token;
}

module.exports = { ensureTestAdmin, loginAdmin };
