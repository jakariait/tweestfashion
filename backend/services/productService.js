const fs = require('fs');
const path = require('path');
const ProductModel = require('../models/ProductModel');
const FlagModel = require('../models/FlagModel');
const BrandModel = require('../models/BrandModel');
const CategoryModel = require('../models/CategoryModel');
const SubCategoryModel = require('../models/SubCategoryModel');
const ChildCategoryModel = require('../models/ChildCategoryModel');
const mongoose = require('mongoose');
const { toId } = require('../utils/toId');

const uploadsDir = path.join(__dirname, '../uploads');

const deleteOldFile = (filename) => {
  if (filename) {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const deleteOldFiles = (filenames) => {
  if (Array.isArray(filenames)) {
    filenames.forEach(deleteOldFile);
  }
};

// Create a new product
const createProduct = async (data) => {
  try {
    delete data.hasVariant;
    const product = new ProductModel(data); // Save product with image names
    await product.save();
    return product;
  } catch (error) {
    // The save failed — uploads (variant images) would be orphaned on disk,
    // so remove the files this request had just created
    (data.variants || []).forEach((variant) => deleteOldFile(variant.image));
    throw new Error(error.message);
  }
};

/**
 * Get all products without pagination or filters
 */
const getProducts = async () => {
  try {
    // Fetch all products without any pagination or filters
    const products = await ProductModel.find()
      .select('-createdAt -updatedAt') // Optional fields to exclude from the response
      .populate([
        { path: 'category', select: '-createdAt -updatedAt' },
        { path: 'subCategory', select: '-createdAt -updatedAt' },
        { path: 'childCategory', select: '-createdAt -updatedAt' },
        { path: 'flags', select: '-createdAt -updatedAt' },
      { path: 'brand', select: '-createdAt -updatedAt' },
        { path: 'variants.attributes.option', select: '-createdAt -updatedAt' },
      ]);

    return products;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get a single product by ID
 */
const getProductById = async (productId) => {
  try {
    const product = await ProductModel.findById(productId).populate([
      { path: 'category', select: '-createdAt -updatedAt' },
      { path: 'subCategory', select: '-createdAt -updatedAt' },
      { path: 'childCategory', select: '-createdAt -updatedAt' },
      { path: 'flags', select: '-createdAt -updatedAt' },
      { path: 'brand', select: '-createdAt -updatedAt' },
      { path: 'variants.attributes.option', select: '-createdAt -updatedAt' },
    ]);
    if (!product) throw new Error('Product not found');
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get a product by slug
const getProductBySlug = async (slug) => {
  try {
    // Ensure to use the slug directly, not the productId
    const product = await ProductModel.findOne({ slug }).populate([
      { path: 'category', select: '-createdAt -updatedAt' },
      { path: 'subCategory', select: '-createdAt -updatedAt' },
      { path: 'childCategory', select: '-createdAt -updatedAt' },
      { path: 'flags', select: '-createdAt -updatedAt' },
      { path: 'brand', select: '-createdAt -updatedAt' },
      { path: 'variants.attributes.option', select: '-createdAt -updatedAt' },
    ]);

    if (!product) throw new Error('Product not found');

    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Delete a product by ID
 */
const deleteProduct = async (productId) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    if (!deletedProduct) throw new Error('Product not found');

    if (deletedProduct.thumbnailImage) {
      deleteOldFile(deletedProduct.thumbnailImage);
    }
    if (deletedProduct.images && deletedProduct.images.length > 0) {
      deleteOldFiles(deletedProduct.images);
    }
    deletedProduct.variants.forEach((variant) => {
      if (variant.image) deleteOldFile(variant.image);
    });

    return deletedProduct;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all products with pagination, filters, and sorting
// const getAllProducts = async ({
//   page = 1,
//   limit = 10,
//   sort,
//   category,
//   subcategory,
//   childCategory,
//   stock,
//   flags,
//   isActive,
//   search, // <-- added
// }) => {
//   try {
//     // Fetch category, subcategory, and childCategory independently
//     const [categoryDoc, subCategoryDoc, childCategoryDoc, flagDocs] =
//       await Promise.all([
//         category
//           ? CategoryModel.findOne({ name: category }).select("_id")
//           : null,
//         subcategory
//           ? SubCategoryModel.findOne({
//               slug: subcategory,
//               isActive: true,
//             }).select("_id")
//           : null,
//         childCategory
//           ? ChildCategoryModel.findOne({
//               slug: childCategory,
//               isActive: true,
//             }).select("_id")
//           : null,
//         flags
//           ? FlagModel.find({
//               name: { $in: flags.split(",") },
//               isActive: true,
//             }).select("_id")
//           : [],
//       ]);
//
//     // If any provided category, subcategory, or childCategory is invalid, return an empty result
//     if (
//       (category && !categoryDoc) ||
//       (subcategory && !subCategoryDoc) ||
//       (childCategory && !childCategoryDoc) ||
//       (flags && flagDocs.length === 0)
//     ) {
//       return {
//         products: [],
//         totalProducts: 0,
//         totalPages: 0,
//         currentPage: page,
//       };
//     }
//
//     let query = {};
//
//     if (typeof isActive === "boolean") {
//       query.isActive = isActive;
//     }
//
//     // Apply filters for valid active categories, subcategories, and child categories
//     if (categoryDoc) query.category = categoryDoc._id;
//     if (subCategoryDoc) query.subCategory = subCategoryDoc._id;
//     if (childCategoryDoc) query.childCategory = childCategoryDoc._id;
//
//     // Apply stock filter (in-stock or out-of-stock)
//     if (stock === "in") query.finalStock = { $gt: 0 };
//     if (stock === "out") query.finalStock = { $lte: 0 };
//
//
//
//
//
//     // Apply flags filter if provided
//     if (flagDocs.length)
//       query.flags = { $in: flagDocs.map((flag) => flag._id) };
//
//     // Default sorting to newest first
//     let sortOption = { createdAt: -1 };
//
//     // Check for valid sorting values
//     const validSortValues = [
//       "price_high",
//       "price_low",
//       "name_asc",
//       "name_desc",
//       "latest",
//       "oldest",
//     ];
//     if (sort && !validSortValues.includes(sort)) {
//       return {
//         products: [],
//         totalProducts: 0,
//         totalPages: 0,
//         currentPage: page,
//       };
//     }
//
//     // Sorting logic
//     if (sort === "price_high") sortOption = { finalDiscount: -1 };
//     if (sort === "price_low") sortOption = { finalDiscount: 1 };
//     if (sort === "name_asc") sortOption = { name: 1 }; // A-Z
//     if (sort === "name_desc") sortOption = { name: -1 }; // Z-A
//     if (sort === "oldest") sortOption = { createdAt: 1 }; // Oldest first
//
//     // Count total products based on the active filter
//     const totalProducts = await ProductModel.countDocuments(query);
//
//     // Fetch products with filters, sorting, and pagination
//     const products = await ProductModel.find(query)
//       .sort(sortOption)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .select(
//         "name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags productId",
//       )
//       .populate([
//         { path: "category", select: "-createdAt -updatedAt" },
//         { path: "flags", select: "-createdAt -updatedAt" },
//         { path: "variants.size", select: "-createdAt -updatedAt" },
//       ]);
//     if (
//       (category && !categoryDoc) ||
//       (subcategory && !subCategoryDoc) ||
//       (childCategory && !childCategoryDoc) ||
//       (flags && flagDocs.length === 0)
//     ) {
//       return {
//         products: [],
//         totalProducts: 0,
//         totalPages: 0,
//         currentPage: page,
//       };
//     }
//
// // ✅ ADD THIS NEXT
//     if (search && search.trim()) {
//       const matchedProduct = await ProductModel.findOne({
//         $expr: {
//           $eq: [{ $toLower: "$name" }, search.toLowerCase()],
//         },
//         isActive: true,
//       })
//         .select(
//           "name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags"
//         )
//         .populate([
//           { path: "category", select: "-createdAt -updatedAt" },
//           { path: "flags", select: "-createdAt -updatedAt" },
//           { path: "variants.size", select: "-createdAt -updatedAt" },
//         ]);
//
//       return {
//         products: matchedProduct ? [matchedProduct] : [],
//         totalProducts: matchedProduct ? 1 : 0,
//         totalPages: 1,
//         currentPage: page,
//       };
//     }
//
//     return {
//       products,
//       totalProducts,
//       totalPages: Math.ceil(totalProducts / limit),
//       currentPage: page,
//     };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

const getAllProducts = async ({
  page = 1,
  limit = 10,
  sort,
  category,
  subcategory,
  childCategory,
  stock,
  flags,
  isActive,
  search,
  brand,
}) => {
  try {
    // Fetch category, subcategory, childCategory, flags, and brand independently
    const [categoryDoc, subCategoryDoc, childCategoryDoc, flagDocs, brandDoc] = await Promise.all([
      category ? CategoryModel.findOne({ name: category }).select('_id') : null,
      subcategory
        ? SubCategoryModel.findOne({
            slug: subcategory,
            isActive: true,
          }).select('_id')
        : null,
      childCategory
        ? ChildCategoryModel.findOne({
            slug: childCategory,
            isActive: true,
          }).select('_id')
        : null,
      flags
        ? FlagModel.find({
            name: { $in: flags.split(',') },
            isActive: true,
          }).select('_id')
        : [],
      // Brand is filtered by name (case-insensitive), matching /shop?brand=Samsung
      brand
        ? BrandModel.findOne({ name: { $regex: `^${brand}$`, $options: 'i' } }).select('_id')
        : null,
    ]);

    // If any provided category, subcategory, childCategory, flags or brand is invalid, return empty result
    if (
      (category && !categoryDoc) ||
      (subcategory && !subCategoryDoc) ||
      (childCategory && !childCategoryDoc) ||
      (flags && flagDocs.length === 0) ||
      (brand && !brandDoc)
    ) {
      return {
        products: [],
        totalProducts: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // Build the query object
    let query = {};

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    if (categoryDoc) query.category = categoryDoc._id;
    if (subCategoryDoc) query.subCategory = subCategoryDoc._id;
    if (childCategoryDoc) query.childCategory = childCategoryDoc._id;
    if (brandDoc) query.brand = brandDoc._id;

    if (stock === 'in') query.finalStock = { $gt: 0 };
    if (stock === 'out') query.finalStock = { $lte: 0 };

    if (flagDocs.length) {
      query.flags = { $in: flagDocs.map((flag) => flag._id) };
    }

    // Add search filter: partial, case-insensitive match across the whole
    // product — name, productCode, slug, productId, variant attribute values
    // and the category name — applied before pagination, so every page of
    // results is drawn from the full filtered set
    if (search && search.trim()) {
      const term = search.trim();
      const regex = { $regex: term, $options: 'i' };
      const orFilters = [
        { name: regex },
        { productCode: regex },
        { slug: regex },
        { 'variants.attributes.value': regex },
      ];
      const numericTerm = Number(term);
      if (!Number.isNaN(numericTerm)) {
        orFilters.push({ productId: numericTerm });
      }
      const matchingCategories = await CategoryModel.find({ name: regex }).select('_id');
      if (matchingCategories.length) {
        orFilters.push({
          category: { $in: matchingCategories.map((c) => c._id) },
        });
      }
      query.$or = orFilters;
    }

    // Validate sort option
    const validSortValues = [
      'price_high',
      'price_low',
      'name_asc',
      'name_desc',
      'latest',
      'oldest',
    ];
    if (sort && !validSortValues.includes(sort)) {
      return {
        products: [],
        totalProducts: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // Define sorting options
    let sortOption = { createdAt: -1 }; // default newest first
    if (sort === 'price_high') sortOption = { finalDiscount: -1 };
    if (sort === 'price_low') sortOption = { finalDiscount: 1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'name_desc') sortOption = { name: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    // Count total documents matching the query
    const totalProducts = await ProductModel.countDocuments(query);

    // Fetch products with filters, sorting, and pagination
    const products = await ProductModel.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        'name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags brand productCode freeShipping'
      )
      .populate([
        { path: 'category', select: '-createdAt -updatedAt' },
        { path: 'flags', select: '-createdAt -updatedAt' },
      { path: 'brand', select: '-createdAt -updatedAt' },
        { path: 'variants.attributes.option', select: '-createdAt -updatedAt' },
      ]);

    return {
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateProduct = async (productId, updatedData, files) => {
  try {
    // 1. Find the existing product using MongoDB _id (not productId)
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // --- IMAGE HANDLING START ---
    // Handle thumbnail image update (only if a new file is uploaded)
    if (files && files.thumbnailImage && files.thumbnailImage.length > 0) {
      if (product.thumbnailImage) {
        deleteOldFile(product.thumbnailImage);
      }
      product.thumbnailImage = files.thumbnailImage[0].filename;
    }
    // If no new thumbnail uploaded, keep the old one (do nothing)

    // Handle images array update
    // updatedData.images = req.body.existingImages (may be string or array)
    // Maintain order of images
    let images = [];

    if (updatedData.existingImages) {
      images = Array.isArray(updatedData.existingImages)
        ? updatedData.existingImages
        : [updatedData.existingImages];
    }

    if (files && files.images && files.images.length > 0) {
      images = images.concat(files.images.map((f) => f.filename));
    }

    // Handle deleted images
    if (updatedData.imagesToDelete) {
      const toDelete = Array.isArray(updatedData.imagesToDelete)
        ? updatedData.imagesToDelete
        : [updatedData.imagesToDelete];

      toDelete.forEach(deleteOldFile);
      images = images.filter((img) => !toDelete.includes(img));
    }

    product.images = images;

    // --- IMAGE HANDLING END ---

    // 2. Secure variant updates
    if (updatedData.hasVariant === 'false' || updatedData.hasVariant === false) {
      // User switched to no-variant mode — clear all variants
      updatedData.variants = [];
    } else if (
      updatedData.variants &&
      Array.isArray(updatedData.variants) &&
      updatedData.variants.length > 0
    ) {
      updatedData.variants = updatedData.variants.map((variantData, index) => {
        // Validate attributes
        if (
          !variantData.attributes ||
          !Array.isArray(variantData.attributes) ||
          variantData.attributes.length === 0
        ) {
          throw new Error(`Variant at index ${index} requires at least one attribute`);
        }

        // Validate each attribute has option and value
        for (const attr of variantData.attributes) {
          if (!attr.option || !attr.value) {
            throw new Error(
              `Variant at index ${index} requires option and value for each attribute`
            );
          }
        }

        // Find existing variant by matching all attributes
        const existingVariant = product.variants.find((v) => {
          if (v.attributes.length !== variantData.attributes.length) return false;
          return v.attributes.every((attr, i) => {
            const inputAttr = variantData.attributes[i];
            // Compare both as string ids via toId to handle populated docs,
            // ObjectIds and raw strings uniformly
            return (
              toId(attr.option) === toId(inputAttr.option) &&
              String(attr.value) === String(inputAttr.value)
            );
          });
        });

        if (existingVariant) {
          // Variant images: '' means the user cleared it, a changed filename
          // means a freshly uploaded replacement (merged by the controller).
          // Unchanged/removed images are reconciled by the orphan cleanup
          // below, which deletes files no longer present in the new list.
          return {
            _id: existingVariant._id,
            attributes: existingVariant.attributes,
            image:
              variantData.image !== undefined
                ? variantData.image
                : existingVariant.image || '',
            stock:
              variantData.stock !== undefined ? Number(variantData.stock) : existingVariant.stock,
            price:
              variantData.price !== undefined ? Number(variantData.price) : existingVariant.price,
            discount:
              variantData.discount !== undefined
                ? variantData.discount === ''
                  ? null
                  : Number(variantData.discount)
                : existingVariant.discount,
          };
        }

        // New variant
        if (!variantData.price || !variantData.stock) {
          throw new Error(`New variant requires price and stock`);
        }

        return {
          attributes: variantData.attributes.map((attr) => ({
            option: new mongoose.Types.ObjectId(attr.option),
            value: String(attr.value),
          })),
          image: variantData.image || '',
          price: Number(variantData.price),
          stock: Number(variantData.stock),
          discount: variantData.discount === '' ? null : Number(variantData.discount) || null,
        };
      });
    } else {
      // No variants provided — clear existing variants
      updatedData.variants = [];
    }

    // Handle other updates and save...
    delete updatedData.hasVariant;

    // Variant images currently referenced by the article in the database,
    // to be reconciled against the new list after the save succeeds
    const oldVariantImages = product.variants.map((v) => v.image).filter(Boolean);

    Object.assign(product, updatedData);

    await product.save();

    // Unlink files that are no longer referenced by the saved document:
    // cleared by the user (''), replaced by a freshly uploaded image, or
    // belonging to variants that were removed. Shared names (same image on
    // several variants) survive until their last reference goes.
    if (Array.isArray(updatedData.variants)) {
      const keptVariantImages = new Set(
        updatedData.variants.map((v) => v.image).filter(Boolean),
      );
      oldVariantImages.forEach((oldImage) => {
        if (!keptVariantImages.has(oldImage)) {
          deleteOldFile(oldImage);
        }
      });
    }

    return product;
  } catch (error) {
    console.error('Update failed:', {
      error: error.message,
      inputVariants: updatedData.variants,
      existingVariants: product?.variants?.map((v) => ({
        _id: v._id,
        attributes: v.attributes,
        price: v.price,
        stock: v.stock,
      })),
    });
    throw new Error(`Update failed: ${error.message}`);
  }
};

// Similar Products for product details page
const getSimilarProducts = async (category, excludeId) => {
  try {
    const categoryObjectId = new mongoose.Types.ObjectId(category);
    const excludeObjectId = new mongoose.Types.ObjectId(excludeId);

    // Fetch products without specific sorting
    const similarProducts = await ProductModel.find({
      category: categoryObjectId,
      _id: { $ne: excludeObjectId },
      isActive: true,
    })
      .limit(8) // Limiting to 12 products
      .select(
        'name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags productId freeShipping'
      )
      .populate([
        { path: 'category', select: '-createdAt -updatedAt' },
        { path: 'flags', select: '-createdAt -updatedAt' },
      { path: 'brand', select: '-createdAt -updatedAt' },
        { path: 'variants.attributes.option', select: '-createdAt -updatedAt' },
      ]);

    // Randomize the order using a Fisher-Yates shuffle
    const shuffledProducts = shuffleArray(similarProducts);

    return shuffledProducts;
  } catch (error) {
    throw new Error('Failed to fetch similar products: ' + error.message);
  }
};

// Fisher-Yates shuffle function to randomize the array
const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
};

// Get Products Details For Order
const getProductDetailsService = async ({ productId, variantId }) => {
  if (!productId) {
    throw { status: 400, message: '⚠️ productId is required!' };
  }

  const product = await ProductModel.findById(productId).lean();

  if (!product) {
    throw { status: 404, message: '❌ Product not found!' };
  }

  // Check if the product has variants
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  // 🔒 If product has variants but no variantId provided
  if (hasVariants && !variantId) {
    throw {
      status: 400,
      message: '⚠️ variantId is required for products with variants!',
    };
  }

  // 👉 If variantId is provided
  if (variantId) {
    const selectedVariant = product.variants.find(
      (variant) => variant._id.toString() === variantId
    );

    if (!selectedVariant) {
      throw { status: 404, message: '❌ Variant not found!' };
    }

    return {
      message: '✅ Product variant retrieved successfully!',
      variant: true,
      data: {
        productId: product._id,
        name: product.name,
        thumbnailImage: product.thumbnailImage,
        images: product.images,
        category: product.category,
        freeShipping: product.freeShipping,
        selectedVariant: {
          _id: selectedVariant._id,
          attributes: selectedVariant.attributes,
          image: selectedVariant.image ?? '',
          price: selectedVariant.price,
          stock: selectedVariant.stock,
          discount: selectedVariant.discount ?? 0,
        },
      },
    };
  }

  // ✅ If product has no variants and no variantId is required
  return {
    message: '✅ Product (no variant) retrieved successfully!',
    variant: false,
    data: {
      productId: product._id,
      name: product.name,
      shortDesc: product.shortDesc,
      longDesc: product.longDesc,
      thumbnailImage: product.thumbnailImage,
      images: product.images,
      category: product.category,
      finalPrice: product.finalPrice,
      finalDiscount: product.finalDiscount,
      finalStock: product.finalStock,
      freeShipping: product.freeShipping,
    },
  };
};

const getHomePageProducts = async () => {
  try {
    // Step 1: Get all active flags
    const flags = await FlagModel.find({ isActive: true }).sort({
      createdAt: -1,
    });

    // Step 2: Prepare an object to hold products for each flag
    const result = {};

    for (const flag of flags) {
      const products = await ProductModel.find({
        flags: flag._id,
        isActive: true,
      })
        .limit(10)
        .sort({ createdAt: -1 }) // Sort products by newest first

        .select(
          'name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags freeShipping'
        )
        .populate([
          { path: 'category', select: '-createdAt -updatedAt' },
          { path: 'flags', select: '-createdAt -updatedAt' },
      { path: 'brand', select: '-createdAt -updatedAt' },
          { path: 'variants.attributes.option', select: '-createdAt -updatedAt' },
        ]);

      result[flag.name] = products;
    }

    return result;
  } catch (error) {
    throw new Error('Failed to load homepage products: ' + error.message);
  }
};

const duplicateProduct = async (productId) => {
  try {
    const originalProduct = await ProductModel.findById(productId);
    if (!originalProduct) throw new Error('Product not found');

    const doc = originalProduct.toObject();

    delete doc._id;
    delete doc.productId;
    delete doc.slug;
    delete doc.createdAt;
    delete doc.updatedAt;
    delete doc.__v;

    // Copy image files with new names to avoid unlinking issues
    const copyImage = (filename) => {
      if (!filename) return filename;
      const ext = path.extname(filename);
      const baseName = path.basename(filename, ext);
      const newFilename = `${baseName}_copy_${Date.now()}${ext}`;
      const oldPath = path.join(uploadsDir, filename);
      const newPath = path.join(uploadsDir, newFilename);
      if (fs.existsSync(oldPath)) {
        fs.copyFileSync(oldPath, newPath);
      }
      return newFilename;
    };

    if (doc.thumbnailImage) {
      doc.thumbnailImage = copyImage(doc.thumbnailImage);
    }

    if (doc.images && doc.images.length > 0) {
      doc.images = doc.images.map((img) => copyImage(img));
    }

    const variantsData = doc.variants;
    delete doc.variants;

    const newProduct = new ProductModel(doc);

    if (variantsData && variantsData.length > 0) {
      newProduct.variants = variantsData.map((v) => {
        const { _id, ...rest } = v;
        // Copy the variant image file under a new name like other images
        if (rest.image) rest.image = copyImage(rest.image);
        return rest;
      });
    }

    await newProduct.save();
    return newProduct;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSimilarProducts,
  getProductDetailsService,
  getHomePageProducts,
  duplicateProduct,
};
