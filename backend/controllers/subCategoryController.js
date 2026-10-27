const subCategoryService = require('../services/subCategoryService');
const fs = require('fs');
const path = require('path');

// Create a new subcategory
const createSubCategory = async (req, res) => {
  try {
    const subCategoryData = { ...req.body };

    if (req.files && req.files.image) {
      subCategoryData.image = req.files.image[0].filename;
    }

    const subCategory = await subCategoryService.createSubCategory(subCategoryData);
    res.status(201).json({ message: 'Subcategory created successfully', subCategory });
  } catch (error) {
    if (req.files && req.files.image) {
      const uploadedPath = path.join(__dirname, '..', 'uploads', req.files.image[0].filename);
      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
    }
    res.status(400).json({ message: 'Error creating subcategory: ' + error.message });
  }
};

// Get all subcategories
const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await subCategoryService.getAllSubCategories();
    res.status(200).json({ message: 'Subcategories fetched successfully', subCategories });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching subcategories: ' + error.message });
  }
};

// Get a single subcategory by ID
const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await subCategoryService.getSubCategoryById(req.params.id);
    if (!subCategory) throw new Error('Subcategory not found');
    res.status(200).json({ message: 'Subcategory fetched successfully', subCategory });
  } catch (error) {
    res.status(404).json({ message: 'Error fetching subcategory: ' + error.message });
  }
};

// Update a subcategory
const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategoryData = { ...req.body };

    const existingSubCategory = await subCategoryService.getSubCategoryById(id);
    if (!existingSubCategory) throw new Error('Subcategory not found');

    if (req.files && req.files.image) {
      if (existingSubCategory.image) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', existingSubCategory.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      subCategoryData.image = req.files.image[0].filename;
    }

    const subCategory = await subCategoryService.updateSubCategory(id, subCategoryData);
    res.status(200).json({ message: 'Subcategory updated successfully', subCategory });
  } catch (error) {
    if (req.files && req.files.image) {
      const uploadedPath = path.join(__dirname, '..', 'uploads', req.files.image[0].filename);
      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
    }
    res.status(400).json({ message: 'Error updating subcategory: ' + error.message });
  }
};

// Delete a subcategory
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await subCategoryService.getSubCategoryById(id);
    if (!subCategory) throw new Error('Subcategory not found');

    if (subCategory.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', subCategory.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await subCategoryService.deleteSubCategory(id);
    res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(404).json({ message: 'Error deleting subcategory: ' + error.message });
  }
};

module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
};
