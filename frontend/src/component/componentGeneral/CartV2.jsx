import React from 'react';
import useCartStore from '../../store/useCartStore.js';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import ImageComponent from './ImageComponent.jsx';
import { FiMinus } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa6';
import emptyCart from '../../assets/empty_cart.png';

const Cart = ({ onCloseCartMenu }) => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();

  // Calculate the total price of all items in the cart
  const totalAmount = cart.reduce((total, item) => {
    const price =
      item.discountPrice > 0 ? item.discountPrice : item.originalPrice;
    return total + price * item.quantity;
  }, 0);

  // Format the totalAmount with commas for better readability
  const formattedTotalAmount = (amount) => {
    return Number(amount).toLocaleString();
  };

  // console.table(cart);

  return (
    <div className="py-3">
      {cart.length === 0 ? (
        <div className="flex items-center justify-center h-[800px] p-4">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-gray-100 p-8">
              <img src={emptyCart} alt="Empty Cart" className="w-36 h-auto" />
            </div>
            <h2 className="mt-6 text-lg font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              There are no more items in your cart!
            </p>

            <Link to={`/shop`}>
              <button
                className="primaryBgColor accentTextColor px-8 py-2.5 rounded-full mt-6 cursor-pointer font-medium shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={onCloseCartMenu}
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/*Header*/}
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-lg font-semibold text-gray-900">Your cart</h2>
            <span className="text-sm text-gray-500">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/*Items*/}
          <ul className="flex flex-col gap-3">
            {cart.map((item) => (
              <li
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3"
              >
                {/*Product Thumbnail*/}
                <Link
                  to={`/product/${item.slug}`}
                  className="block w-24 shrink-0 self-start overflow-hidden rounded-lg bg-gray-100 sm:w-28"
                >
                  <ImageComponent
                    imageName={item.thumbnail}
                    altName={item.name}
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${item.slug}`} className="min-w-0">
                      <h3 className="line-clamp-2 overflow-hidden text-ellipsis text-sm font-medium leading-snug text-gray-900 hover:underline">
                        {item.name}
                      </h3>
                    </Link>

                    {/*Delete Button*/}
                    <button
                      onClick={() =>
                        removeFromCart(item.productId, item.variant)
                      } // <-- FIXED
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 rounded-full p-2 text-gray-400 cursor-pointer transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>

                  {item.variant !== 'Default' && (
                    <p className="w-fit rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      Variant: {item.variant}
                    </p>
                  )}

                  {/*Prices*/}
                  <div className="flex flex-col gap-0.5">
                    {item.discountPrice > 0 ? (
                      <>
                        {/*Discount Price*/}
                        <p className="text-base font-semibold text-red-800">
                          Offer Price: Tk.{' '}
                          {formattedTotalAmount(
                            item.discountPrice * item.quantity,
                          )}
                        </p>
                        {/*Original Price*/}
                        <p className="text-xs text-gray-500">
                          Price:{' '}
                          <span className="line-through">
                            Tk.{' '}
                            {formattedTotalAmount(
                              item.originalPrice * item.quantity,
                            )}
                          </span>
                        </p>
                        {/*Discount Amount*/}
                        <p className="w-fit rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          You Save: Tk.{' '}
                          {formattedTotalAmount(
                            item.originalPrice - item.discountPrice,
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-semibold text-gray-900">
                        Price: Tk.{' '}
                        {formattedTotalAmount(
                          item.originalPrice * item.quantity,
                        )}
                      </p>
                    )}
                  </div>

                  {/*Quantity*/}
                  <div className="mt-auto flex items-center">
                    <div className="inline-flex items-center overflow-hidden rounded-full border border-gray-200">
                      {/*Decrease Button*/}
                      <button
                        className="primaryBgColor accentTextColor px-3 py-2 cursor-pointer transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={() =>
                          updateQuantity(
                            item.productId, // <-- FIXED
                            item.variant,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus />
                      </button>
                      <span className="min-w-10 bg-white px-3 text-center text-sm font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      {/*Increase Button*/}
                      <button
                        className="primaryBgColor accentTextColor px-3 py-2 cursor-pointer transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={() =>
                          updateQuantity(
                            item.productId, // <-- FIXED
                            item.variant,
                            item.quantity + 1,
                          )
                        }
                        disabled={item.quantity >= 5}
                        aria-label="Increase quantity"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/*Summary*/}
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-base font-medium text-gray-700">Totals</h1>
              <span className="text-xl font-bold text-gray-900">
                Tk {formattedTotalAmount(totalAmount)}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/checkout"
                className="primaryBgColor accentTextColor rounded-full px-4 py-3 text-center font-medium shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={onCloseCartMenu}
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={clearCart}
                className="rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 cursor-pointer transition hover:bg-red-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
