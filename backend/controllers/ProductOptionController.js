const productOptionService = require('../services/ProductOptionService');

// Create Product Option
const createProductOption = async (req, res) => {
  try {
    const { name, values } = req.body;
    if (!name || !values) {
      return res.status(400).json({ message: 'Name and values are required' });
    }
    const newProductOption = await productOptionService.createProductOption(name, values);
    return res.status(201).json({
      message: 'Product Option created successfully',
      productOption: newProductOption,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'An error occurred while creating the product option',
      error: error.message,
    });
  }
};

// Update Product Option by ID
const updateProductOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, values } = req.body;
    if (!name && !values) {
      return res.status(400).json({ message: 'Name or values is required' });
    }
    const updatedProductOption = await productOptionService.updateProductOption(id, name, values);
    if (!updatedProductOption) {
      return res.status(404).json({ message: 'Product Option not found' });
    }
    return res.status(200).json({
      message: 'Product Option updated successfully',
      productOption: updatedProductOption,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'An error occurred while updating the product option',
      error: error.message,
    });
  }
};

// Get All Product Options
const getAllProductOptions = async (req, res) => {
  try {
    const productOptions = await productOptionService.getAllProductOptions();
    return res.status(200).json({
      message: 'Product Options fetched successfully',
      productOptions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'An error occurred while fetching the product options',
      error: error.message,
    });
  }
};

// Get Product Option by ID
const getProductOptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const productOption = await productOptionService.getProductOptionById(id);
    if (!productOption) {
      return res.status(404).json({ message: 'Product Option not found' });
    }
    return res.status(200).json({
      message: 'Product Option fetched successfully',
      productOption,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'An error occurred while fetching the product option',
      error: error.message,
    });
  }
};

// Delete Product Option by ID
const deleteProductOption = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProductOption = await productOptionService.deleteProductOption(id);
    if (!deletedProductOption) {
      return res.status(404).json({ message: 'Product Option not found' });
    }
    return res.status(200).json({
      message: 'Product Option deleted successfully',
      productOption: deletedProductOption,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'An error occurred while deleting the product option',
      error: error.message,
    });
  }
};

module.exports = {
  createProductOption,
  updateProductOption,
  getAllProductOptions,
  getProductOptionById,
  deleteProductOption,
};
