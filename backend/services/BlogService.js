const fs = require('fs');
const path = require('path');
const BlogModel = require('../models/BlogModel');

const uploadsDir = path.join(__dirname, '../uploads');

const deleteOldFile = (filename) => {
  if (filename) {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// Create a new blog
const createBlog = (data) => {
  const blog = new BlogModel(data);
  return blog.save();
};

// Get all blogs with optional filters (no pagination)
const getAllBlogs = (filters = {}) => {
  return BlogModel.find(filters).select('-longDesc').sort({ createdAt: -1 });
};

// Get paginated blogs with filters
const getPaginatedBlogs = (filters = {}, skip = 0, limit = 10) => {
  return BlogModel.find(filters)
    .select('-longDesc')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Get total blog count with filters
const getTotalBlogCount = (filters = {}) => {
  return BlogModel.countDocuments(filters);
};

// Get only active blogs with pagination
const getActiveBlogs = (skip = 0, limit = 10) => {
  return BlogModel.find({ isActive: true })
    .select('-longDesc')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Get count of active blogs
const getActiveBlogCount = () => {
  return BlogModel.countDocuments({ isActive: true });
};

// Get blog by slug (only active)
const getBlogBySlug = (slug) => {
  return BlogModel.findOne({ slug, isActive: true });
};

// Get blog by ID
const getBlogById = (id) => {
  return BlogModel.findById(id);
};

// Update blog by ID
const updateBlog = async (id, updates) => {
  if (updates.thumbnailImage) {
    const existingBlog = await BlogModel.findById(id);
    if (existingBlog && existingBlog.thumbnailImage) {
      deleteOldFile(existingBlog.thumbnailImage);
    }
  }
  return BlogModel.findByIdAndUpdate(id, updates, { new: true });
};

// Delete blog by ID
const deleteBlog = async (id) => {
  const blog = await BlogModel.findById(id);
  if (blog && blog.thumbnailImage) {
    deleteOldFile(blog.thumbnailImage);
  }
  return BlogModel.findByIdAndDelete(id);
};

module.exports = {
  createBlog,
  getAllBlogs,
  getPaginatedBlogs,
  getTotalBlogCount,
  getActiveBlogs,
  getActiveBlogCount,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
};
