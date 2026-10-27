const CartModel = require('../models/CartModel');

const getCart = async (userId) => {
  const cart = await CartModel.findOne({ user: userId });
  return cart || { user: userId, items: [] };
};

const addToCart = async (userId, item) => {
  if (!item.productId || !item.quantity) {
    throw new Error('Missing productId or quantity');
  }

  let cart = await CartModel.findOne({ user: userId });

  if (!cart) {
    cart = new CartModel({ user: userId, items: [item] });
  } else {
    // Match by variantId if available, otherwise by variant field for backward compatibility
    const matchKey = item.variantId || item.variant;
    const index = cart.items.findIndex(
      (i) =>
        i.productId?.toString() === item.productId?.toString() &&
        (i.variantId === matchKey || i.variant === matchKey)
    );

    if (index > -1) {
      cart.items[index].quantity += item.quantity;
      if (cart.items[index].quantity > 5) {
        cart.items[index].quantity = 5;
      }
    } else {
      cart.items.push(item);
    }
  }

  await cart.save();
  return cart;
};

const updateCartItem = async (userId, productId, variant, quantity) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');

  // Match by variantId or variant field for backward compatibility
  const index = cart.items.findIndex(
    (item) =>
      item.productId.toString() === productId &&
      (item.variantId === variant || item.variant === variant)
  );

  if (index > -1) {
    cart.items[index].quantity = quantity;
    await cart.save();
    return cart;
  } else {
    throw new Error('Item not found in cart');
  }
};

const removeCartItem = async (userId, productId, variant) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');

  // Match by variantId or variant field for backward compatibility
  cart.items = cart.items.filter(
    (item) =>
      !(
        item.productId.toString() === productId &&
        (item.variantId === variant || item.variant === variant)
      )
  );
  await cart.save();
  return cart;
};

const clearCart = async (userId) => {
  const cart = await CartModel.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return { message: 'Cart cleared successfully' };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
