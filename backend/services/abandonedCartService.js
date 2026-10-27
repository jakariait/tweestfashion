const AbandonedCart = require('../models/AbandonedCartModel');
const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');
const OrderCounter = require('../models/OrderCounterModel');
const VatPercentage = require('../models/VatPercentage');
const Shipping = require('../models/ShippingModel');
const FreeDeliveryAmount = require('../models/FreeDeliveryAmount');

// Helper function to get variant display name from attributes
const getVariantDisplayName = (variant) => {
  if (!variant) return 'N/A';

  // Handle new variant structure with attributes
  if (variant.attributes && Array.isArray(variant.attributes)) {
    const attributeValues = variant.attributes.map((attr) => attr.value).filter((val) => val);
    if (attributeValues.length > 0) {
      return attributeValues.join(' / ');
    }
  }

  // Fallback for old structure (if any legacy data exists)
  if (variant.size?.name) {
    return variant.size.name;
  }

  return 'N/A';
};

const createAbandonedCart = async (cartData) => {
  try {
    const abandonedCart = new AbandonedCart(cartData);
    const savedCart = await abandonedCart.save();
    return savedCart;
  } catch (error) {
    throw new Error('Error creating abandoned cart: ' + error.message);
  }
};

const deleteAbandonedCartById = async (cartId) => {
  try {
    const deletedCart = await AbandonedCart.findByIdAndDelete(cartId);
    return deletedCart; // null if not found
  } catch (error) {
    throw new Error('Error deleting abandoned cart: ' + error.message);
  }
};

const getAllAbandonedCarts = async (
  page = 1,
  limit = 10,
  sort = 'desc',
  status = 'all',
  search = '',
  startDate = null,
  endDate = null
) => {
  try {
    const skip = (page - 1) * limit;

    let filter = {};

    // Status filter
    if (status && status !== 'all') {
      if (status === 'abandoned') {
        filter = { $or: [{ status: 'abandoned' }, { status: { $exists: false } }] };
      } else {
        filter.status = status;
      }
    }

    // Search by number
    if (search) {
      filter.number = { $regex: search, $options: 'i' };
    }

    // Date range filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate) };
    }

    const totalCount = await AbandonedCart.countDocuments(filter);

    const sortOrder = sort === 'asc' ? 1 : -1;

    const carts = await AbandonedCart.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const allProductIds = [
      ...new Set(carts.flatMap((cart) => cart.cartItems.map((item) => item.productId))),
    ];

    const products = await Product.find({ _id: { $in: allProductIds } })
      .populate('category', 'name')
      .populate('variants.attributes.option', 'name')
      .lean();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    carts.forEach((cart) => {
      cart.cartItems = cart.cartItems.map((item) => {
        const product = productMap.get(item.productId?.toString());

        if (product) {
          const matchedVariant = product.variants.find(
            (v) => v._id.toString() === item.variantId?.toString()
          );

          if (matchedVariant) {
            item.variant = {
              ...matchedVariant,
              // Add display name for easy rendering in frontend
              displayName: getVariantDisplayName(matchedVariant),
            };
          }

          item.product = {
            _id: product._id,
            name: product.name,
            productCode: product.productCode,
            category: product.category?.name || 'N/A',
            subCategory: product.subCategory,
            childCategory: product.childCategory,
            thumbnailImage: product.thumbnailImage,
            images: product.images,
            finalPrice: product.finalPrice,
            finalDiscount: product.finalDiscount,
            finalStock: product.finalStock,
            slug: product.slug,
          };
        }

        return item;
      });
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
      carts,
    };
  } catch (error) {
    throw new Error('Error fetching abandoned carts: ' + error.message);
  }
};

const updateAbandonedCart = async (cartId, updateData) => {
  try {
    const updatedCart = await AbandonedCart.findByIdAndUpdate(cartId, updateData, { new: true });
    return updatedCart;
  } catch (error) {
    throw new Error('Error updating abandoned cart: ' + error.message);
  }
};

const bulkDeleteAbandonedCarts = async (cartIds) => {
  try {
    const result = await AbandonedCart.deleteMany({ _id: { $in: cartIds } });
    return result;
  } catch (error) {
    throw new Error('Error bulk deleting abandoned carts: ' + error.message);
  }
};

const convertToOrder = async (cartId, orderData) => {
  try {
    const cart = await AbandonedCart.findById(cartId);
    if (!cart) {
      throw new Error('Abandoned cart not found');
    }

    if (cart.status === 'converted') {
      throw new Error('This cart has already been converted to an order');
    }

    const counter = await OrderCounter.findOneAndUpdate(
      { id: 'order' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderNo = String(counter.seq).padStart(6, '0');

    const vatEntry = await VatPercentage.findOne().sort({ createdAt: -1 });
    const vatPercent = vatEntry ? vatEntry.value : 0;

    let subtotal = 0;
    const updatedItems = [];

    for (const item of cart.cartItems) {
      const { productId, variantId, quantity, price } = item;

      const product = await Product.findById(productId);
      if (!product) throw new Error(`Product not found: ${productId}`);

      let currentPrice = price;
      let stock;

      if (product.variants.length === 0) {
        stock = product.finalStock;
        if (stock < quantity) {
          throw new Error(`Not enough stock for product ${product.name}`);
        }
        product.finalStock -= quantity;
        await product.save();
      } else {
        const variant = product.variants.find((v) => v._id.toString() === variantId?.toString());
        if (!variant) throw new Error('Variant not found');

        if (variant.stock < quantity) {
          throw new Error(`Not enough stock for variant`);
        }
        currentPrice = variant.discount || variant.price;
        variant.stock -= quantity;
        await product.save();
      }

      subtotal += currentPrice * quantity;
      updatedItems.push({ productId, variantId, quantity, price: currentPrice });
    }

    const shippingMethod = await Shipping.findById(orderData.shippingId);
    if (!shippingMethod) throw new Error('Invalid shipping method');

    const freeDelivery = await FreeDeliveryAmount.findOne().sort({
      createdAt: -1,
    });
    const freeDeliveryThreshold = freeDelivery ? freeDelivery.value : 0;

    const deliveryCharge =
      freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : shippingMethod.value;

    const vat = (subtotal * vatPercent) / 100;
    const totalAmount = subtotal + vat + deliveryCharge;

    const newOrder = new Order({
      orderNo,
      userId: cart.userId,
      items: updatedItems,
      subtotalAmount: subtotal,
      deliveryCharge,
      vat,
      totalAmount,
      deliveryMethod: 'home_delivery',
      paymentMethod: orderData.paymentMethod || 'cash_on_delivery',
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
      shippingInfo: {
        fullName: orderData.fullName || cart.fullName,
        mobileNo: orderData.number || cart.number,
        email: orderData.email || cart.email,
        address: orderData.address || cart.address,
      },
      billingInfo: {
        fullName: orderData.fullName || cart.fullName,
        address: orderData.address || cart.address,
      },
      shippingId: orderData.shippingId,
      promoDiscount: 0,
      specialDiscount: orderData.specialDiscount || 0,
      rewardPointsUsed: 0,
      rewardPointsEarned: 0,
      adminNote: '',
    });

    const savedOrder = await newOrder.save();

    await AbandonedCart.findByIdAndUpdate(cartId, {
      status: 'converted',
      convertedToOrderId: savedOrder._id,
    });

    return savedOrder;
  } catch (error) {
    throw new Error('Error converting to order: ' + error.message);
  }
};

const getAbandonedCartStats = async () => {
  try {
    const totalCount = await AbandonedCart.countDocuments();
    const abandonedCount = await AbandonedCart.countDocuments({
      $or: [{ status: 'abandoned' }, { status: { $exists: false } }],
    });
    const convertedCount = await AbandonedCart.countDocuments({ status: 'converted' });

    const ratio = totalCount > 0 ? ((convertedCount / totalCount) * 100).toFixed(1) : 0;

    return {
      totalCount,
      abandonedCount,
      convertedCount,
      ratio: parseFloat(ratio),
    };
  } catch (error) {
    throw new Error('Error fetching abandoned cart stats: ' + error.message);
  }
};

module.exports = {
  createAbandonedCart,
  getAllAbandonedCarts,
  deleteAbandonedCartById,
  updateAbandonedCart,
  bulkDeleteAbandonedCarts,
  convertToOrder,
  getAbandonedCartStats,
};
