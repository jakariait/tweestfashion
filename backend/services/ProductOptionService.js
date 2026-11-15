const ProductOptionModel = require('../models/ProductOptionModel');

const createProductOption = async (name, values) => {
  const productOption = new ProductOptionModel({ name, values });
  return await productOption.save();
};

// Update Product Option by ID
const updateProductOption = async (id, name, values) => {
  return await ProductOptionModel.findByIdAndUpdate(id, { name, values }, { new: true });
};

// Older documents stored `values` as plain strings. Hydrated against the
// current schema they become objects with numeric (character index) keys and
// no `value` field, so normalize both shapes to { value, numberOfProduct }.
const normalizeValue = (val) => {
  if (val == null) return val;
  if (typeof val === 'string') {
    return { value: val, numberOfProduct: 1 };
  }
  if (typeof val === 'object') {
    if (val.value !== undefined) {
      return {
        value: val.value,
        numberOfProduct: val.numberOfProduct ?? 1,
      };
    }
    const legacyValue = Object.keys(val)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => val[key])
      .join('');
    if (legacyValue) {
      return {
        value: legacyValue,
        numberOfProduct: val.numberOfProduct ?? 1,
      };
    }
  }
  return val;
};

const normalizeOption = (option) => {
  if (!option) return option;
  const plain = typeof option.toObject === 'function' ? option.toObject() : option;
  return {
    ...plain,
    values: (plain.values || []).map(normalizeValue),
  };
};

// Get All Product Options
const getAllProductOptions = async () => {
  const options = await ProductOptionModel.find().select('-createdAt -updatedAt');
  return options.map(normalizeOption);
};

// Get Product Option by ID
const getProductOptionById = async (id) => {
  const option = await ProductOptionModel.findById(id).select('-createdAt -updatedAt');
  return normalizeOption(option);
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
