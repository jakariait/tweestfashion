const BrandModel = require('../models/BrandModel');

const createBrand = async (brandData) => {
  const brand = new BrandModel(brandData);
  return await brand.save();
};

const getBrands = async () => {
  return await BrandModel.find();
};

const getBrandById = async (id) => {
  return await BrandModel.findById(id);
};

const updateBrand = async (id, brandData) => {
  return await BrandModel.findByIdAndUpdate(id, brandData, { new: true });
};

const deleteBrand = async (id) => {
  return await BrandModel.findByIdAndDelete(id);
};

const getBrandBySlug = async (slug) => {
  return await BrandModel.findOne({ slug });
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandBySlug,
};
