const fs = require('fs');
const path = require('path');
const CustomerFeedbackModel = require('../models/CustomerFeedbackModel');

const uploadsDir = path.join(__dirname, '../uploads');

const deleteOldFile = (filename) => {
  if (filename) {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilters = (query = {}) => {
  const filters = {};

  if (query.isActive !== undefined) {
    filters.isActive = query.isActive === 'true';
  }

  if (query.rating !== undefined && query.rating !== '') {
    const rating = Number(query.rating);
    if (Number.isFinite(rating)) {
      filters.rating = rating;
    }
  }

  if (query.search && query.search.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), 'i');
    filters.$or = [{ name: regex }, { location: regex }, { message: regex }];
  }

  return filters;
};

const createFeedback = async (data) => {
  return await CustomerFeedbackModel.create(data);
};

const getPaginatedFeedback = async (filters = {}, skip = 0, limit = 10) => {
  return await CustomerFeedbackModel.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

const getFeedbackCount = async (filters = {}) => {
  return await CustomerFeedbackModel.countDocuments(filters);
};

const getFeedbackById = async (id) => {
  return await CustomerFeedbackModel.findById(id);
};

const getActiveFeedback = async (limit = 20) => {
  return await CustomerFeedbackModel.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit);
};

const updateFeedback = async (id, updates) => {
  if (Object.prototype.hasOwnProperty.call(updates, 'image')) {
    const existingFeedback = await CustomerFeedbackModel.findById(id);
    if (existingFeedback && existingFeedback.image && existingFeedback.image !== updates.image) {
      deleteOldFile(existingFeedback.image);
    }
  }

  return await CustomerFeedbackModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};

const deleteFeedback = async (id) => {
  const feedback = await CustomerFeedbackModel.findById(id);
  if (feedback && feedback.image) {
    deleteOldFile(feedback.image);
  }
  return await CustomerFeedbackModel.findByIdAndDelete(id);
};

module.exports = {
  buildFilters,
  createFeedback,
  getPaginatedFeedback,
  getFeedbackCount,
  getFeedbackById,
  getActiveFeedback,
  updateFeedback,
  deleteFeedback,
};
