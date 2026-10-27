const mongoose = require('mongoose');
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const OrderCounter = require('../models/OrderCounterModel');
const VatPercentage = require('../models/VatPercentage'); // adjust path as needed
const Shipping = require('../models/ShippingModel');
const FreeDeliveryAmount = require('../models/FreeDeliveryAmount');
const User = require('../models/UserModel');
const Coupon = require('../models/CouponModel');

const createOrder = async (orderData, userId) => {
  try {
    // Get user (optional for guests)
    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) throw new Error('User not found');
    }

    // Generate order number
    const counter = await OrderCounter.findOneAndUpdate(
      { id: 'order' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderNo = String(counter.seq).padStart(6, '0');

    // Get VAT
    const vatEntry = await VatPercentage.findOne().sort({ createdAt: -1 });
    const vatPercent = vatEntry ? vatEntry.value : 0;

    // Calculate subtotal and update stock
    let subtotal = 0;
    const updatedItems = [];
    let hasFreeShippingProduct = false;

    for (const item of orderData.items) {
      const { productId, variantId, quantity } = item;

      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');

      if (product.freeShipping) {
        hasFreeShippingProduct = true;
      }

      let price, stock;

      if (product.variants.length === 0) {
        price = product.finalDiscount > 0 ? product.finalDiscount : product.finalPrice;
        stock = product.finalStock;

        if (stock < quantity) throw new Error(`Not enough stock for product ${productId}`);

        product.finalStock -= quantity;
        await product.save();
      } else {
        const variant = product.variants.find((v) => v._id.toString() === variantId);
        if (!variant) throw new Error('Variant not found');

        if (variant.stock < quantity) throw new Error(`Not enough stock for variant ${variantId}`);

        price = variant.discount || variant.price;

        variant.stock -= quantity;
        await product.save();
      }

      subtotal += price * quantity;
      updatedItems.push({ productId, variantId, quantity, price }); // Store price for each item
    }

    // Handle shipping
    const shippingMethod = await Shipping.findById(orderData.shippingId);
    if (!shippingMethod) throw new Error('Invalid shipping method');

    const freeDelivery = await FreeDeliveryAmount.findOne().sort({
      createdAt: -1,
    });
    const freeDeliveryThreshold = freeDelivery ? freeDelivery.value : 0;

    const deliveryCharge =
      hasFreeShippingProduct || (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold)
        ? 0
        : shippingMethod.value;

    // ✅ Backend Coupon Validation
    let promoDiscount = 0;
    let appliedCouponCode = orderData.promoCode || null;

    if (appliedCouponCode) {
      const coupon = await Coupon.findOne({
        code: appliedCouponCode.toUpperCase(),
        status: 'active',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!coupon) throw new Error('Invalid or expired promo code');

      if (subtotal < coupon.minimumOrder)
        throw new Error(`Minimum order amount for this coupon is ৳${coupon.minimumOrder}`);

      if (coupon.type === 'percentage') {
        promoDiscount = Math.floor((coupon.value / 100) * subtotal);
      } else if (coupon.type === 'amount') {
        promoDiscount = coupon.value;
      }

      // Cap promo discount if it exceeds subtotal
      promoDiscount = Math.min(promoDiscount, subtotal);
    }

    // Reward points
    const rewardPointsUsed = orderData.rewardPointsUsed || 0;
    const finalSubtotal = subtotal - promoDiscount - rewardPointsUsed;

    const vat = (finalSubtotal * vatPercent) / 100;
    const totalAmount = finalSubtotal + vat + deliveryCharge;

    // Save order
    const newOrder = new Order({
      ...orderData,
      orderNo,
      userId,
      items: updatedItems,
      subtotalAmount: subtotal,
      deliveryCharge,
      vat,
      totalAmount,
      promoCode: appliedCouponCode,
      promoDiscount,
      rewardPointsUsed,
      specialDiscount: orderData.specialDiscount || 0,
      rewardPointsEarned: 0,
      adminNote: orderData.adminNote || '',
    });

    const savedOrder = await newOrder.save();

    return savedOrder;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllOrders = async (filter = {}, page, limit, search = '', startDate, endDate) => {
  try {
    let queryFilter = { ...filter };

    // Add date range filtering if startDate and/or endDate are provided
    if (startDate || endDate) {
      queryFilter.createdAt = {};
      if (startDate) {
        queryFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // To include the entire end day, set the end of the day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        queryFilter.createdAt.$lte = endOfDay;
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      queryFilter.$or = [
        { orderNo: searchRegex },
        { 'shippingInfo.fullName': searchRegex },
        { 'shippingInfo.mobileNo': searchRegex },
        { 'shippingInfo.email': searchRegex },
        { 'shippingInfo.address': searchRegex },
      ];
    }

    // 1. Create count query
    const countQuery = Order.countDocuments(queryFilter);

    // 2. Create find query without populates and with .lean() for performance
    let findQuery = Order.find(queryFilter).sort({ createdAt: -1 }).lean();

    // 3. Apply pagination to the find query
    if (page && limit) {
      const validatedPage = Math.max(1, parseInt(page));
      const validatedLimit = Math.max(1, parseInt(limit));
      const skip = (validatedPage - 1) * validatedLimit;
      findQuery = findQuery.skip(skip).limit(validatedLimit);
    }

    // 4. Execute both count and find queries in parallel
    const [totalOrders, orders] = await Promise.all([countQuery, findQuery]);

    // 5. Calculate pagination details
    let totalPages = null;
    let currentPage = null;
    if (page && limit) {
      const validatedPage = Math.max(1, parseInt(page));
      const validatedLimit = Math.max(1, parseInt(limit));
      totalPages = Math.ceil(totalOrders / validatedLimit);
      currentPage = validatedPage;
    }

    return {
      totalOrders,
      orders,
      totalPages,
      currentPage,
    };
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    throw new Error('Error fetching orders: ' + error.message);
  }
};

// Get order by ID
const getOrderById = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('userId')
      .populate({
        path: 'items.productId',
        select:
          '-sizeChart -longDesc -shortDesc -shippingReturn -videoUrl -flags -metaTitle -metaDescription -metaKeywords -searchTags',
        populate: [
          {
            path: 'category',
            select: 'name', // Only bring category name
          },
          {
            path: 'variants.attributes.option',
            select: 'name',
          },
        ],
      })
      .populate({
        path: 'items.variantId',
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!order) {
      throw new Error('Order not found');
    }

    // Filter and structure variants for each item
    const finalItems = order.items.map((item) => {
      if (!item.productId || !item.productId.variants || !item.variantId) {
        return item;
      }

      const matchedVariant = item.productId.variants.find(
        (variant) => variant._id.toString() === item.variantId.toString()
      );

      return {
        ...item,
        productId: {
          ...item.productId,
          variants: matchedVariant ? [matchedVariant] : [],
        },
      };
    });

    order.items = finalItems;

    return order;
  } catch (error) {
    throw new Error('Error fetching order by ID: ' + error.message);
  }
};

const updateOrder = async (orderId, updateData) => {
  try {
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const finalUpdate = { ...updateData };

    // If items are being updated, adjust stock and recalculate subtotal
    if (finalUpdate.items) {
      let subtotal = 0;
      const productsToUpdate = new Map(); // Map<string, MongooseDocument>

      // Create maps for old and new items for efficient lookup
      const newItemsMap = new Map(
        finalUpdate.items.map((item) => [(item.variantId || item.productId).toString(), item])
      );
      const oldItemsMap = new Map(
        existingOrder.items.map((item) => [(item.variantId || item.productId).toString(), item])
      );
      const allItemKeys = new Set([...newItemsMap.keys(), ...oldItemsMap.keys()]);

      // First pass: Fetch all products and run checks against in-memory state
      for (const itemKey of allItemKeys) {
        const oldItem = oldItemsMap.get(itemKey);
        const newItem = newItemsMap.get(itemKey);
        const quantityChange = (oldItem ? oldItem.quantity : 0) - (newItem ? newItem.quantity : 0);

        if (quantityChange === 0) {
          if (newItem) subtotal += newItem.price * newItem.quantity;
          continue;
        }

        const itemForStock = oldItem || newItem;
        const productIdStr = itemForStock.productId.toString();

        let product = productsToUpdate.get(productIdStr);
        if (!product) {
          product = await Product.findById(itemForStock.productId);
          if (!product) throw new Error('Product not found');
          productsToUpdate.set(productIdStr, product);
        }

        const hasVariants = product.variants && product.variants.length > 0;

        if (hasVariants) {
          if (!itemForStock.variantId) {
            throw new Error(`Product ${product.name} has variants, but variantId is missing.`);
          }
          const variant = product.variants.find(
            (v) => v._id.toString() === itemForStock.variantId.toString()
          );
          if (!variant) throw new Error(`Variant not found for id ${itemForStock.variantId}`);

          if (quantityChange < 0 && variant.stock < -quantityChange) {
            throw new Error(`Not enough stock for variant ${variant.name}`);
          }
          // Apply change to in-memory document
          variant.stock += quantityChange;
        } else {
          if (itemForStock.variantId) {
            throw new Error(`Product ${product.name} has no variants, but variantId was provided.`);
          }
          if (quantityChange < 0 && product.finalStock < -quantityChange) {
            throw new Error(`Not enough stock for product ${product.name}`);
          }
          // Apply change to in-memory document
          product.finalStock += quantityChange;
        }

        if (newItem) {
          subtotal += newItem.price * newItem.quantity;
        }
      }

      // Second pass: If all checks passed, save all modified products
      const savePromises = [];
      for (const product of productsToUpdate.values()) {
        savePromises.push(product.save());
      }
      await Promise.all(savePromises);

      finalUpdate.subtotalAmount = subtotal;
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(orderId, finalUpdate, {
      new: true,
    });
    if (!updatedOrder) {
      throw new Error('Order not found after update');
    }

    // Stock adjustment for status changes (only if items were not updated in this call)
    if (!finalUpdate.items && finalUpdate.orderStatus) {
      const isNowReturnedOrCancelled =
        updatedOrder.orderStatus === 'returned' || updatedOrder.orderStatus === 'cancelled';
      const wasNotReturnedOrCancelled =
        existingOrder.orderStatus !== 'returned' && existingOrder.orderStatus !== 'cancelled';

      if (isNowReturnedOrCancelled && wasNotReturnedOrCancelled) {
        for (const item of updatedOrder.items) {
          const { productId, variantId, quantity } = item;
          const product = await Product.findById(productId);
          if (!product) continue; // Or throw an error

          if (variantId) {
            const variant = product.variants.find((v) => v._id.toString() === variantId.toString());
            if (variant) {
              variant.stock += quantity;
            }
          } else {
            product.finalStock += quantity;
          }
          await product.save();
        }
      }

      const isRevertingToActiveStatus =
        (existingOrder.orderStatus === 'returned' || existingOrder.orderStatus === 'cancelled') &&
        ['pending', 'approved', 'intransit', 'delivered'].includes(updatedOrder.orderStatus);

      if (isRevertingToActiveStatus) {
        for (const item of updatedOrder.items) {
          const { productId, variantId, quantity } = item;
          const product = await Product.findById(productId);
          if (!product) continue; // Or throw an error

          if (variantId) {
            const variant = product.variants.find((v) => v._id.toString() === variantId.toString());
            if (variant) {
              variant.stock -= quantity;
            }
          } else {
            product.finalStock -= quantity;
          }
          await product.save();
        }
      }
    }

    if (updatedOrder.orderStatus === 'delivered' && existingOrder.orderStatus !== 'delivered') {
      updatedOrder.paymentStatus = 'paid';
      await updatedOrder.save();
    }

    const result = await getOrderById(orderId);

    return {
      success: true,
      message: `Order updated successfully`,
      updatedOrder: result,
    };
  } catch (error) {
    throw new Error('Error updating order: ' + error.message);
  }
};

// Delete and order
const deleteOrder = async (orderId) => {
  try {
    // Find the order by ID
    const order = await Order.findById(orderId)
      .populate('items.productId')
      .populate('items.variantId');

    if (!order) throw new Error('Order not found');

    // Restore stock for each item in the order
    for (const item of order.items) {
      const { productId, variantId, quantity } = item;

      const product = await Product.findById(productId);
      if (!product) {
        // Skip stock update if product not found, proceed with order deletion
        continue;
      }

      if (product.variants.length === 0) {
        // If the product doesn't have variants, restore the stock to the product
        product.finalStock += quantity;
        await product.save();
      } else {
        // If the product has variants, find the specific variant and restore the stock
        const variant = product.variants.find((v) => v._id.toString() === variantId.toString());
        if (!variant) {
          // Skip stock update if variant not found
          continue;
        }

        variant.stock += quantity;
        await product.save();
      }
    }

    // Delete the order after updating stock
    await Order.findByIdAndDelete(orderId);

    return { message: 'Order deleted successfully, stock updated' };
  } catch (error) {
    // Abort the transaction if there's an error
    throw new Error('Error deleting order and updating stock: ' + error.message);
  }
};

const getOrderByOrderNo = async (orderNo) => {
  try {
    const order = await Order.findOne({ orderNo })
      .populate('userId')
      .populate({
        path: 'items.productId',
        select:
          '-sizeChart -longDesc -shortDesc -shippingReturn -videoUrl -flags -metaTitle -metaDescription -metaKeywords -searchTags',
        populate: [
          {
            path: 'category',
            select: 'name',
          },
          {
            path: 'variants.attributes.option',
            select: 'name',
          },
        ],
      })
      .populate({
        path: 'items.variantId',
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!order) {
      throw new Error('Order not found');
    }

    // Filter and structure variants for each item
    const finalItems = order.items.map((item) => {
      if (!item.productId || !item.productId.variants || !item.variantId) {
        return item;
      }
      const matchedVariant = item.productId.variants.find(
        (variant) => variant._id.toString() === item.variantId.toString()
      );

      return {
        ...item,
        productId: {
          ...item.productId,
          variants: matchedVariant ? [matchedVariant] : [],
        },
      };
    });
    order.items = finalItems;

    return order;
  } catch (error) {
    throw new Error('Error fetching order by orderNo: ' + error.message);
  }
};

const getOrdersByUserId = async (userId) => {
  try {
    const orders = await Order.find({ userId })
      .populate({
        path: 'items.productId',
        select:
          '-sizeChart -longDesc -shortDesc -shippingReturn -videoUrl -flags -metaTitle -metaDescription -metaKeywords -searchTags',
        populate: [
          {
            path: 'category',
            select: 'name',
          },
          {
            path: 'variants.attributes.option',
            select: 'name',
          },
        ],
      })
      .populate({
        path: 'items.variantId',
      })
      .sort({ createdAt: -1 })
      .lean();

    const totalOrders = orders.length;

    if (totalOrders === 0) {
      throw new Error('No orders found for this user');
    }

    // Clean up and structure variants for all orders
    const updatedOrders = orders.map((order) => {
      const finalItems = order.items.map((item) => {
        if (!item.productId || !item.productId.variants || !item.variantId) {
          return item;
        }
        const matchedVariant = item.productId.variants.find(
          (variant) => variant._id.toString() === item.variantId.toString()
        );

        return {
          ...item,
          productId: {
            ...item.productId,
            variants: matchedVariant ? [matchedVariant] : [],
          },
        };
      });
      order.items = finalItems;
      return order;
    });

    return {
      totalOrders,
      orders: updatedOrders,
    };
  } catch (error) {
    throw new Error('Error fetching orders by userId: ' + error.message);
  }
};

const trackOrderByOrderNoAndPhone = async (orderNo, phone) => {
  const order = await Order.findOne({ orderNo })
    .populate('userId', 'phone')
    .populate({
      path: 'items.productId',
      select:
        '-sizeChart -longDesc -shortDesc -shippingReturn -videoUrl -flags -metaTitle -metaDescription -metaKeywords -searchTags',
      populate: [
        {
          path: 'category',
          select: 'name',
        },
        {
          path: 'variants.attributes.option',
          select: 'name',
        },
      ],
    })
    .populate('items.variantId')
    .lean();

  if (!order) {
    throw new Error('Order not found');
  }

  // Get phone from userId or shippingInfo or fallback to order.phone
  const storedPhone = order.userId?.phone || order.shippingInfo?.mobileNo || order.phone;

  const normalize = (num) => (num || '').replace(/[^0-9]/g, '').replace(/^88/, '');

  if (normalize(storedPhone) !== normalize(phone)) {
    throw new Error('Phone number does not match order');
  }

  // Structure variants for each item
  order.items = order.items.map((item) => {
    if (item.productId?.variants && item.variantId) {
      const matchedVariant = item.productId.variants.find(
        (variant) => variant._id.toString() === item.variantId.toString()
      );

      return {
        ...item,
        productId: {
          ...item.productId,
          variants: matchedVariant ? [matchedVariant] : [],
        },
      };
    }
    return item;
  });

  return order;
};

const updateMultipleOrderStatuses = async (orderIds, orderStatus) => {
  const results = [];
  const errors = [];
  for (const orderId of orderIds) {
    try {
      const result = await updateOrder(orderId, { orderStatus });
      results.push(result.updatedOrder);
    } catch (error) {
      errors.push({ orderId, error: error.message });
    }
  }
  return {
    success: errors.length === 0,
    totalUpdated: results.length,
    totalErrors: errors.length,
    results,
    errors,
  };
};

const bulkDeleteOrders = async (orderIds) => {
  const results = [];
  const errors = [];
  for (const orderId of orderIds) {
    try {
      const result = await deleteOrder(orderId);
      results.push(result);
    } catch (error) {
      errors.push({ orderId, error: error.message });
    }
  }
  return {
    success: errors.length === 0,
    totalDeleted: results.length,
    totalErrors: errors.length,
    results,
    errors,
  };
};

const getCustomersFromOrders = async (search, page, limit) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$shippingInfo.mobileNo',
          fullName: { $last: '$shippingInfo.fullName' },
          email: { $last: '$shippingInfo.email' },
          address: { $last: '$shippingInfo.address' },
          phone: { $last: '$shippingInfo.mobileNo' },
          lastOrderDate: { $last: '$createdAt' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
        },
      },
      { $sort: { lastOrderDate: -1 } },
    ];

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      pipeline.unshift({
        $match: {
          $or: [
            { 'shippingInfo.fullName': searchRegex },
            { 'shippingInfo.mobileNo': searchRegex },
            { 'shippingInfo.email': searchRegex },
            { 'shippingInfo.address': searchRegex },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Order.aggregate(countPipeline);
    const totalCustomers = countResult[0]?.total || 0;

    const usePagination = page && limit;
    if (usePagination) {
      const validatedPage = Math.max(1, parseInt(page));
      const validatedLimit = Math.max(1, parseInt(limit));
      pipeline.push({ $skip: (validatedPage - 1) * validatedLimit });
      pipeline.push({ $limit: validatedLimit });
    }

    const customers = await Order.aggregate(pipeline);

    const totalPages = usePagination ? Math.ceil(totalCustomers / parseInt(limit)) : null;
    const currentPage = usePagination ? parseInt(page) : null;

    return { customers, totalCustomers, totalPages, currentPage };
  } catch (error) {
    throw new Error('Error fetching customers from orders: ' + error.message);
  }
};

const getOrdersByPhone = async (phone) => {
  try {
    const orders = await Order.find({ 'shippingInfo.mobileNo': phone })
      .populate({
        path: 'items.productId',
        select: 'name finalPrice finalDiscount finalStock variants images',
      })
      .populate({
        path: 'items.variantId',
      })
      .sort({ createdAt: -1 })
      .lean();
    return orders;
  } catch (error) {
    throw new Error('Error fetching orders by phone: ' + error.message);
  }
};

// Export the functions as an object
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderByOrderNo,
  getOrdersByUserId,
  trackOrderByOrderNoAndPhone,
  updateMultipleOrderStatuses,
  bulkDeleteOrders,
  getCustomersFromOrders,
  getOrdersByPhone,
};
