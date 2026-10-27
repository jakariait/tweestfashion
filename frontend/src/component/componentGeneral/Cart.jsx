import { useEffect, useState } from 'react';
import axios from 'axios';
import useCartStore from '../../store/useCartStore.js';
import { Link } from 'react-router-dom';
import { FaTrash, FaTruck } from 'react-icons/fa';
import ImageComponent from './ImageComponent.jsx';
import { FiMinus } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa6';
import emptyCart from '../../assets/empty_cart.png';

const Cart = ({ onCloseCartMenu }) => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [freeDelivery, setFreeDelivery] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAmount = async () => {
      try {
        const res = await axios.get(`${apiUrl}/getFreeDeliveryAmount`);
        if (res.data?.success) {
          setFreeDelivery(res.data?.data?.value);
        }
      } catch (err) {
        console.error('Failed to fetch free delivery amount:', err.message);
      }
    };

    fetchAmount();
  }, [apiUrl]);

  const totalAmount = cart.reduce((total, item) => {
    const price =
      item.discountPrice > 0 ? item.discountPrice : item.originalPrice;
    return total + price * item.quantity;
  }, 0);

  const totalSavings = cart.reduce((total, item) => {
    if (item.discountPrice > 0) {
      return total + (item.originalPrice - item.discountPrice) * item.quantity;
    }
    return total;
  }, 0);

  const formatPrice = (amount) => Number(amount).toLocaleString();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-6 text-center">
        <img src={emptyCart} alt="Empty Cart" className="w-40 h-auto" />
        <p className="mt-2 font-medium text-gray-800">Your cart is empty</p>
        <p className="text-sm text-gray-500">
          Add items to get started — your cart is waiting.
        </p>
        <Link
          to="/shop"
          onClick={onCloseCartMenu}
          className="primaryBgColor accentTextColor mt-4 rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Items */}
      <div className="flex-1 space-y-3">
        {cart.map((item) => {
          const unitPrice =
            item.discountPrice > 0 ? item.discountPrice : item.originalPrice;
          const lineTotal = unitPrice * item.quantity;

          return (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-3 rounded-xl border border-gray-200 bg-white p-2.5"
            >
              {/* Product thumbnail */}
              <Link
                to={`/product/${item.slug}`}
                onClick={onCloseCartMenu}
                className="shrink-0"
              >
                <ImageComponent
                  imageName={item.thumbnail}
                  altName={item.name}
                  className="h-20 w-20 rounded-lg object-cover"
                  skeletonHeight={80}
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={onCloseCartMenu}
                    className="line-clamp-2 text-sm font-medium leading-snug text-gray-800 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.productId, item.variant)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="shrink-0 text-gray-400 transition-colors hover:text-red-500 cursor-pointer"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>

                {item.variant !== 'Default' && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    Variant: {item.variant}
                  </p>
                )}

                {/* Price */}
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-gray-900">
                    Tk. {formatPrice(unitPrice)}
                  </span>
                  {item.discountPrice > 0 && (
                    <span className="text-xs line-through text-gray-400">
                      Tk. {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                {item.discountPrice > 0 && (
                  <p className="text-[11px] font-medium text-green-700">
                    You save Tk.{' '}
                    {formatPrice(
                      (item.originalPrice - item.discountPrice) * item.quantity,
                    )}
                  </p>
                )}

                {/* Quantity + line total */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <button
                      className="px-2.5 py-1.5 text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variant,
                          item.quantity - 1,
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span className="min-w-[2rem] px-1 text-center text-sm font-semibold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2.5 py-1.5 text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Increase quantity"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variant,
                          item.quantity + 1,
                        )
                      }
                      disabled={item.quantity >= 5}
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    Tk. {formatPrice(lineTotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky footer — pinned to the bottom of the drawer */}
      <div className="sticky bottom-0 mt-3 border-t border-gray-200 bg-white pb-4 pt-3 shadow-[0_-8px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </span>
          <span className="text-lg font-bold text-gray-900">
            Tk. {formatPrice(totalAmount)}
          </span>
        </div>
        {totalSavings > 0 && (
          <p className="mt-0.5 text-right text-xs font-medium text-green-700">
            You saved Tk. {formatPrice(totalSavings)}
          </p>
        )}

        {freeDelivery > 0 && (
          <div className="mt-3 rounded-xl bg-gray-50 p-3">
            {totalAmount < freeDelivery ? (
              <>
                <p className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <FaTruck
                    className="shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  Add{' '}
                  <span className="font-bold text-gray-900">
                    Tk. {formatPrice(freeDelivery - totalAmount)}
                  </span>{' '}
                  more to get free delivery
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="primaryBgColor h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((totalAmount / freeDelivery) * 100),
                      )}%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <FaTruck
                  className="shrink-0 text-green-600"
                  aria-hidden="true"
                />
                Free delivery unlocked — shipping is on us
              </p>
            )}
          </div>
        )}

        <p className="mt-1 text-xs text-gray-500">
          {freeDelivery > 0 && totalAmount >= freeDelivery
            ? 'Free delivery applied at checkout'
            : 'Shipping calculated at checkout'}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-700">
          <FaTruck className="text-gray-400" aria-hidden="true" />
          Cash on delivery — pay when you receive
        </p>

        <div className="mt-3 space-y-2">
          <Link
            to="/checkout"
            onClick={onCloseCartMenu}
            className="primaryBgColor accentTextColor block w-full rounded-xl py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.99]"
          >
            Proceed to Checkout
          </Link>
          <button
            onClick={clearCart}
            className="w-full rounded-xl border border-red-200 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
