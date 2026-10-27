const AdminModel = require('../models/AdminModel');
const bcrypt = require('bcryptjs');

const adminService = {
  getAllAdmins: async () => {
    return await AdminModel.find().select('-password');
  },

  getAdminById: async (id) => await AdminModel.findById(id).select('-password'),

  createAdmin: async (adminData) => {
    const allowedFields = ['name', 'email', 'mobileNo', 'password', 'permissions'];
    const sanitized = {};
    for (const field of allowedFields) {
      if (adminData[field] !== undefined) sanitized[field] = adminData[field];
    }
    return AdminModel.create(sanitized);
  },

  updateAdmin: async (id, adminData) => {
    const allowedFields = ['name', 'email', 'mobileNo', 'password', 'permissions'];
    const updateData = {};
    for (const field of allowedFields) {
      if (adminData[field] !== undefined) updateData[field] = adminData[field];
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    return await AdminModel.findByIdAndUpdate(id, updateData, { new: true });
  },

  deleteAdmin: async (id) => await AdminModel.findByIdAndDelete(id),
};

module.exports = adminService;
