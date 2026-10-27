const productService = require('../services/productService');
const mongoose = require('mongoose');
const { client: redisClient, clearCachePattern } = require('../config/redisClient');
const ProductModel = require('../models/ProductModel');
const { revalidateNext } = require('../utility/revalidateNext');

// Invalidate every cached product listing (plain + query-key variants)
const invalidateProductCache = () => {
  clearCachePattern('/api/products*');
};

// Files uploaded under `variantImages` are mapped onto variants by their
// positions sent in the parallel `variantImageIndices` body field, so the
// frontend can attach a new image file to any variant row.
const mergeVariantImages = (req) => {
  const files = req.files;
  const indices = req.body?.variantImageIndices;
  if (!files || !files.variantImages || !indices) return;
  const indexList = Array.isArray(indices) ? indices : [indices];
  req.body.variantImages = undefined;
  req.body.variantImageIndices = undefined;

  const variants = req.body.variants;
  if (!Array.isArray(variants)) return;

  files.variantImages.forEach((file, i) => {
    const idx = Number(indexList[i]);
    if (!Number.isNaN(idx) && variants[idx]) {
      variants[idx].image = file.filename;
    }
  });
};


// An empty string/unselected brand means "no brand" — normalize it so the
// schema keeps Brand as an optional (null) reference
const normalizeBrand = (body) => {
  if (body.brand === '' || body.brand === 'null') {
    body.brand = null;
  } else if (body.brand && !mongoose.Types.ObjectId.isValid(body.brand)) {
    delete body.brand;
  }
};

// Create a product
const createProduct = async (req, res) => {
  try {
    mergeVariantImages(req);
    normalizeBrand(req.body);
    const productData = { ...req.body };

    // Check if thumbnailImage is uploaded
    if (req.files && req.files.thumbnailImage) {
      // Store only the image name (without the full path)
      productData.thumbnailImage = req.files.thumbnailImage[0].filename; // Save only the image name
    }

    // Check if images are uploaded
    if (req.files && req.files.images) {
      // Store only the image names (without the full paths)
      productData.images = req.files.images.map((file) => file.filename); // Save only the image names
    }

    const product = await productService.createProduct(productData);

    // Invalidate the cache
    invalidateProductCache();
    revalidateNext({ tag: 'products' });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product. Please try again!',
      error: error.message,
    });
  }
};

/**
 * Controller: Get all products
 */
const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts(); // Get all products without filters or pagination

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully!',
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products. Please try again!',
      error: error.message,
    });
  }
};

/**
 * Controller: Get a single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found!',
      });
    }

    res.status(200).json({
      success: true,
      message: '✅ Product retrieved successfully!',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product. Please try again!',
      error: error.message,
    });
  }
};
// Get a product by slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params; // Extract the slug from the URL

    // Call the service function to get the product by slug
    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: '✅ Product retrieved successfully!',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product. Please try again!',
      error: error.message,
    });
  }
};

/**
 * Controller: Delete a product by ID
 */
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await productService.deleteProduct(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found for deletion!',
      });
    }

    // Invalidate the cache
    invalidateProductCache();
    revalidateNext({ tag: 'products' });

    res.status(200).json({
      success: true,
      message: '✅ Product deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product. Please try again!',
      error: error.message,
    });
  }
};

// Get all products with filters, sorting, and pagination
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort,
      category,
      subcategory,
      childCategory,
      stock,
      flags,
      search,
      brand,
    } = req.query;

    const productsData = await productService.getAllProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      category,
      subcategory,
      childCategory,
      stock,
      flags,
      isActive: true,
      search,
      brand,
    });

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      ...productsData, // Contains products, totalPages, totalProducts, currentPage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;
    const files = req.files; // Get uploaded files

    mergeVariantImages(req);
    normalizeBrand(updatedData);

    // Call the service with `files`
    const updatedProduct = await productService.updateProduct(productId, updatedData, files);

    // Invalidate the cache
    invalidateProductCache();
    revalidateNext({ tag: 'products' });

    return res.status(200).json({
      success: true,
      message: '✅ Product updated successfully!',
      data: updatedProduct,
    });
  } catch (err) {
    // Validation/user-data errors come back as 400 with the service message,
    // so clients can show them inline; unexpected failures stay 500.
    const isValidationError = /variant|attribute|option|price|stock|not found|requires/i.test(err.message);
    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSimilarProductsController = async (req, res) => {
  const { category, productId } = req.params;

  try {
    // Quick check for valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(category) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category or product ID.',
      });
    }

    const products = await productService.getSimilarProducts(category, productId);

    res.status(200).json({
      success: true,
      message: 'Similar products fetched successfully',
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar products',
      error: error.message,
    });
  }
};

// Get all products for the Admin Panel (no filter on isActive)
const getAllProductsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort,
      category,
      subcategory,
      childCategory,
      stock,
      flags,
      search,
      brand,
    } = req.query;

    // Call the service without the isActive filter (to get all products)
    const productsData = await productService.getAllProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      category,
      subcategory,
      childCategory,
      stock,
      flags,
      search,
      brand,
      // Don't pass isActive filter here, meaning it will return all products
    });

    const [activeCount, inactiveCount, allProductsCount] = await Promise.all([
      ProductModel.countDocuments({ isActive: true }),
      ProductModel.countDocuments({ isActive: false }),
      // Grand total across the whole collection — unaffected by search or
      // filters, so the admin stat cards always show real totals
      ProductModel.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      message: 'All products fetched successfully for Admin Panel',
      ...productsData, // Contains products, totalPages, totalProducts, currentPage
      activeCount,
      inactiveCount,
      allProductsCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products for Admin Panel',
      error: error.message,
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const result = await productService.getProductDetailsService({
      productId,
      variantId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error('❌ Error in getProductDetails:', error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || '🚨 Server error!',
    });
  }
};

const homePageProducts = async (req, res) => {
  try {
    const data = await productService.getHomePageProducts();
    res.status(200).json({
      status: 'success',
      message: 'Home page products fetched successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

const duplicateProduct = async (req, res) => {
  try {
    const product = await productService.duplicateProduct(req.params.id);

    invalidateProductCache();

    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully!',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProductBySlug,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSimilarProductsController,
  getAllProductsAdmin,
  getProductDetails,
  homePageProducts,
  duplicateProduct,
};
