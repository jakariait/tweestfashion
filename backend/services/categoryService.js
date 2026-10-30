const CategoryModel = require('../models/CategoryModel');
const ProductModel = require('../models/ProductModel');

const createCategory = async (categoryData) => {
  const category = new CategoryModel(categoryData);
  return await category.save();
};

const getCategories = async () => {
  return await CategoryModel.aggregate([
    {
      $lookup: {
        from: ProductModel.collection.name,
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$category', '$$categoryId'] }, { $eq: ['$isActive', true] }],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'productCount',
      },
    },
    {
      $addFields: {
        productsCount: {
          $ifNull: [{ $arrayElemAt: ['$productCount.count', 0] }, 0],
        },
      },
    },
    { $project: { productCount: 0 } },
  ]);
};

const getCategoryById = async (id) => {
  return await CategoryModel.findById(id);
};

const updateCategory = async (id, categoryData) => {
  return await CategoryModel.findByIdAndUpdate(id, categoryData, { new: true });
};

const deleteCategory = async (id) => {
  return await CategoryModel.findByIdAndDelete(id);
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
