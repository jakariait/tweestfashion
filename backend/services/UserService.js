const fs = require('fs');
const path = require('path');
const UserModel = require('../models/UserModel');

const uploadsDir = path.join(__dirname, '../uploads');

const deleteOldFile = (filename) => {
  if (filename) {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const userService = {
  getAllUsers: async () => await UserModel.find(),

  getUserById: async (id) => await UserModel.findById(id),

  createUser: async (userData) => {
    const allowedFields = ['fullName', 'email', 'phone', 'password', 'address', 'userImage'];
    const sanitized = {};
    for (const field of allowedFields) {
      if (userData[field] !== undefined) sanitized[field] = userData[field];
    }
    return UserModel.create(sanitized);
  },

  updateUser: async (id, userData) => {
    const allowedFields = ['fullName', 'email', 'phone', 'address', 'userImage'];
    const sanitized = {};
    for (const field of allowedFields) {
      if (userData[field] !== undefined) sanitized[field] = userData[field];
    }

    if (userData.userImage) {
      const existingUser = await UserModel.findById(id);
      if (existingUser && existingUser.userImage) {
        deleteOldFile(existingUser.userImage);
      }
    }
    return UserModel.findByIdAndUpdate(id, sanitized, {
      new: true,
      runValidators: true,
    });
  },

  deleteUser: async (id) => {
    const user = await UserModel.findById(id);
    if (user && user.userImage) {
      deleteOldFile(user.userImage);
    }
    return UserModel.findByIdAndDelete(id);
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await UserModel.findById(userId).select('+password');
    if (!user) throw new Error('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new Error('Current password is incorrect');

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  },
};

module.exports = userService;
