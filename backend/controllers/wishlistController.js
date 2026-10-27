const wishlistService = require('../services/wishlistService');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user._id);
    res.status(200).json({ message: 'Wishlist fetched successfully', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlist = await wishlistService.addToWishlist(req.user._id, productId);
    res.status(200).json({ message: 'Added to wishlist', wishlist, success: true });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlist = await wishlistService.removeFromWishlist(req.user._id, productId);
    res.status(200).json({ message: 'Removed from wishlist', wishlist, success: true });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const clearWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.clearWishlist(req.user._id);
    res.status(200).json({ message: 'Wishlist cleared', wishlist, success: true });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const checkProductInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const isInWishlist = await wishlistService.checkProductInWishlist(req.user._id, productId);
    res.status(200).json({ isInWishlist });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to check wishlist',
      error: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist,
};
