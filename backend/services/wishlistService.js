const WishlistModel = require('../models/WishlistModel');
const ProductModel = require('../models/ProductModel');

const getWishlist = async (userId) => {
  const wishlist = await WishlistModel.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name slug thumbnailImage finalPrice finalDiscount finalStock productCode variants',
  });

  if (!wishlist) {
    return { user: userId, items: [] };
  }

  return wishlist;
};

const addToWishlist = async (userId, productId) => {
  let wishlist = await WishlistModel.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new WishlistModel({ user: userId, items: [] });
  }

  const existingItem = wishlist.items.find((item) => item.product.toString() === productId);

  if (existingItem) {
    throw new Error('Product already in wishlist');
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  wishlist.items.push({ product: productId });
  await wishlist.save();

  return await WishlistModel.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name slug thumbnailImage finalPrice finalDiscount finalStock productCode variants',
  });
};

const removeFromWishlist = async (userId, productId) => {
  const wishlist = await WishlistModel.findOne({ user: userId });

  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  const itemIndex = wishlist.items.findIndex((item) => item.product.toString() === productId);

  if (itemIndex === -1) {
    throw new Error('Product not in wishlist');
  }

  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  return await WishlistModel.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name slug thumbnailImage finalPrice finalDiscount finalStock productCode variants',
  });
};

const clearWishlist = async (userId) => {
  const wishlist = await WishlistModel.findOne({ user: userId });

  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  wishlist.items = [];
  await wishlist.save();

  return wishlist;
};

const checkProductInWishlist = async (userId, productId) => {
  const wishlist = await WishlistModel.findOne({ user: userId });

  if (!wishlist) {
    return false;
  }

  const exists = wishlist.items.some((item) => item.product.toString() === productId);

  return exists;
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist,
};
