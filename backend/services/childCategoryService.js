const ChildCategory = require('../models/ChildCategoryModel');
const ProductModel = require('../models/ProductModel');

// Create a new child category
const createChildCategory = async (childCategoryData) => {
  try {
    if (!childCategoryData.name || !childCategoryData.category || !childCategoryData.subCategory) {
      throw new Error('Name, category, and subcategory are required fields.');
    }

    const childCategory = new ChildCategory(childCategoryData);
    await childCategory.save();
    return childCategory;
  } catch (error) {
    throw new Error('Error creating child category: ' + error.message);
  }
};

// Get all child categories
const getAllChildCategories = async () => {
  try {
    const [childCategories, counts] = await Promise.all([
      ChildCategory.find()
        .populate('category', 'name')
        .populate('subCategory', 'name')
        .select('-createdAt -updatedAt')
        .lean(),
      ProductModel.aggregate([
        { $match: { isActive: true, childCategory: { $ne: null } } },
        { $group: { _id: '$childCategory', count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    return childCategories.map((childCategory) => ({
      ...childCategory,
      productsCount: countMap.get(String(childCategory._id)) || 0,
    }));
  } catch (error) {
    throw new Error('Error fetching child categories: ' + error.message);
  }
};

// Get a single child category by ID
const getChildCategoryById = async (id) => {
  try {
    const childCategory = await ChildCategory.findById(id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .select('-createdAt -updatedAt')
      .exec();

    if (!childCategory) {
      throw new Error('Child category not found');
    }

    return childCategory;
  } catch (error) {
    throw new Error('Error fetching child category: ' + error.message);
  }
};

// Update a Child Category
const updateChildCategory = async (id, updatedData) => {
  try {
    const childCategory = await ChildCategory.findByIdAndUpdate(id, updatedData, {
      new: true,
    })
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .select('-createdAt -updatedAt')
      .exec();

    if (!childCategory) throw new Error('Child Category not found');

    return childCategory;
  } catch (error) {
    throw new Error('Error updating child category: ' + error.message);
  }
};

// Delete a Child Category
const deleteChildCategory = async (id) => {
  try {
    const childCategory = await ChildCategory.findByIdAndDelete(id);
    if (!childCategory) throw new Error('Child Category not found');

    return { message: 'Child Category deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting child category: ' + error.message);
  }
};

module.exports = {
  createChildCategory,
  getAllChildCategories,
  getChildCategoryById,
  updateChildCategory,
  deleteChildCategory,
};
