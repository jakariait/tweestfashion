const ProductOptionModel = require('../models/ProductOptionModel');

const createProductOption = async (name, values) => {
  const productOption = new ProductOptionModel({ name, values });
  return await productOption.save();
};

// Update Product Option by ID
const updateProductOption = async (id, name, values) => {
  return await ProductOptionModel.findByIdAndUpdate(id, { name, values }, { new: true });
};

// Get All Product Options
const getAllProductOptions = async () => {
  return await ProductOptionModel.find().select('-createdAt -updatedAt');
};

// Get Product Option by ID
const getProductOptionById = async (id) => {
  return await ProductOptionModel.findById(id).select('-createdAt -updatedAt');
};

// Delete Product Option by ID
const deleteProductOption = async (id) => {
  return await ProductOptionModel.findByIdAndDelete(id);
};

module.exports = {
  createProductOption,
  updateProductOption,
  getAllProductOptions,
  getProductOptionById,
  deleteProductOption,
};
