const abandonedCartService = require('../services/abandonedCartService');

const createAbandonedCart = async (req, res) => {
  try {
    const { number, cartItems, userId, fullName, email, address, totalAmount } = req.body;

    if (!number || !cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed: 'number' and 'cartItems' are required and cartItems cannot be empty.",
      });
    }

    const savedCart = await abandonedCartService.createAbandonedCart({
      number,
      cartItems,
      userId,
      fullName,
      email,
      address,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Abandoned cart created successfully.',
      data: savedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create abandoned cart.',
      error: error.message,
    });
  }
};

const getAllAbandonedCarts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'desc';
    const status = req.query.status || 'all';
    const search = req.query.search || '';
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const carts = await abandonedCartService.getAllAbandonedCarts(
      page,
      limit,
      sort,
      status,
      search,
      startDate,
      endDate
    );

    return res.status(200).json({
      success: true,
      message: 'Abandoned carts retrieved successfully.',
      data: carts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve abandoned carts.',
      error: error.message,
    });
  }
};

const getAbandonedCartStats = async (req, res) => {
  try {
    const stats = await abandonedCartService.getAbandonedCartStats();

    return res.status(200).json({
      success: true,
      message: 'Stats retrieved successfully.',
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stats.',
      error: error.message,
    });
  }
};

const deleteAbandonedCart = async (req, res) => {
  try {
    const deletedCart = await abandonedCartService.deleteAbandonedCartById(req.params.id);
    if (!deletedCart) {
      return res.status(404).json({
        success: false,
        message: 'Abandoned cart not found.',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Abandoned cart deleted successfully.',
      data: deletedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete abandoned cart.',
      error: error.message,
    });
  }
};

const updateAbandonedCart = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCart = await abandonedCartService.updateAbandonedCart(id, updateData);

    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: 'Abandoned cart not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Abandoned cart updated successfully.',
      data: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update abandoned cart.',
      error: error.message,
    });
  }
};

const bulkDeleteAbandonedCarts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of cart IDs to delete.',
      });
    }

    const result = await abandonedCartService.bulkDeleteAbandonedCarts(ids);

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} abandoned cart(s) deleted successfully.`,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk delete abandoned carts.',
      error: error.message,
    });
  }
};

const convertToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderData = req.body;

    if (!orderData.shippingId) {
      return res.status(400).json({
        success: false,
        message: 'shippingId is required.',
      });
    }

    const order = await abandonedCartService.convertToOrder(id, orderData);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully from abandoned cart.',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to convert abandoned cart to order.',
      error: error.message,
    });
  }
};

module.exports = {
  createAbandonedCart,
  getAllAbandonedCarts,
  getAbandonedCartStats,
  deleteAbandonedCart,
  updateAbandonedCart,
  bulkDeleteAbandonedCarts,
  convertToOrder,
};
