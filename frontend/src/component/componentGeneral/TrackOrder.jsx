import React, { useState } from 'react';
import OrderProgress from './OrderProgress';
import ImageComponent from './ImageComponent';
import {
  Search,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import sanitizeHtml from '../../utils/sanitizeHtml.js';

const TrackOrder = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageUrl = `${apiUrl.replace('/api', '')}/uploads`;
  const [orderNo, setOrderNo] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // Helper function to get variant display name from attributes
  const getVariantDisplayName = (variant) => {
    if (!variant) return 'N/A';
    if (variant.attributes && Array.isArray(variant.attributes)) {
      const attributeValues = variant.attributes
        .map((attr) => attr.value)
        .filter((val) => val);
      if (attributeValues.length > 0) {
        return attributeValues.join(' / ');
      }
    }
    if (variant.size?.name) {
      return variant.size.name;
    }
    if (variant.sizeName) {
      return variant.sizeName;
    }
    return 'N/A';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`${apiUrl}/track-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to track order');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(price);

  return (
    <div className=" py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600">
            Enter your order number and phone number to track your shipment
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Number Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  required
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="e.g., #123456 or 123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 01XXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer primaryBgColor accentTextColor px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search size={20} />
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-12 flex gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-red-900">Order Not Found</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-blue-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Order Number
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    #{order.orderNo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Order Status
                  </p>
                  <p className="text-lg font-bold mt-2">
                    <span className="inline-block primaryBgColor accentTextColor px-4 py-2 rounded-lg capitalize">
                      {order.status || order.orderStatus}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Order Date
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Progress */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Shipment Status
              </h2>
              <OrderProgress status={order.status || order.orderStatus} />
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-blue-600 rounded mr-3"></div>
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Full Name
                    </p>
                    <p className="text-gray-900 font-semibold mt-2">
                      {order.shippingInfo?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium flex items-center">
                      <Mail size={16} className="mr-2 text-blue-600" />
                      Email Address
                    </p>
                    <p className="text-gray-900 font-semibold mt-2 break-all">
                      {order.shippingInfo?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium flex items-center">
                      <Phone size={16} className="mr-2 text-blue-600" />
                      Phone Number
                    </p>
                    <p className="text-gray-900 font-semibold mt-2">
                      {order.shippingInfo?.mobileNo || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-blue-600 rounded mr-3"></div>
                  Shipping Address
                </h2>
                <div className="flex gap-4">
                  <MapPin
                    className="text-blue-600 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {order.shippingInfo?.fullName}
                    </p>
                    <p className="text-gray-700 mt-2">
                      {order.shippingInfo?.address || 'N/A'}
                    </p>
                    <p className="text-gray-700">
                      {order.shippingInfo?.city}
                      {order.shippingInfo?.state &&
                        `, ${order.shippingInfo.state}`}
                      {order.shippingInfo?.postalCode &&
                        `, ${order.shippingInfo.postalCode}`}
                    </p>
                    <p className="text-gray-700">
                      {order.shippingInfo?.country || 'Bangladesh'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Package size={20} className="mr-2 text-blue-600" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {order.items?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex justify-between items-start text-sm"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">
                        {item.productId?.name}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Qty: {item.quantity}
                        {item.variantId && (
                          <span className="ml-2">
                            •{' '}
                            {getVariantDisplayName(
                              item.productId?.variants?.find(
                                (v) => v._id === item.variantId,
                              ),
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-gray-900 font-semibold ml-2 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-semibold">
                    {formatPrice(
                      order.totalAmount - (order.deliveryCharge || 0),
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-semibold">
                    {formatPrice(order.deliveryCharge || 0)}
                  </span>
                </div>

                {order.promoCode && (
                  <div className="flex justify-between text-sm bg-green-50 p-2 rounded border border-green-200">
                    <span className="text-gray-600">
                      Promo Code ({order.promoCode})
                    </span>
                    <span className="text-green-600 font-semibold">
                      -{formatPrice(order.discount || 0)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-gray-900 font-bold">Total Amount</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-8">
                Order Items
              </h2>
              <div className="space-y-6">
                {order.items?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex gap-6 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-28 h-28 bg-gray-100 rounded-lg overflow-hidden">
                      {item.productId?.thumbnailImage ? (
                        <img
                          src={`${imageUrl}/${item.productId.thumbnailImage}`}
                          alt={item.productId?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Package size={40} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-bold mb-2 text-lg">
                        {item.productId?.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {item.productId?.shortDesc && (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(
                                item.productId.shortDesc.substring(0, 100),
                              ),
                            }}
                          />
                        )}
                      </p>

                      <div className="flex flex-wrap gap-6 text-sm">
                        {item.variantId && (
                          <div>
                            <span className="text-gray-600">Variant: </span>
                            <span className="font-semibold text-gray-900">
                              {getVariantDisplayName(
                                item.productId?.variants?.find(
                                  (v) => v._id === item.variantId,
                                ),
                              )}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Quantity: </span>
                          <span className="font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Unit Price: </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-gray-600 text-sm mb-2">Item Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Truck size={20} className="mr-2 text-blue-600" />
                Delivery Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Delivery Type
                  </p>
                  <p className="text-gray-900 font-bold text-lg capitalize">
                    {order.deliveryType || 'Home Delivery'}
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Delivery Charge
                  </p>
                  <p className="text-green-600 font-bold text-lg">
                    {formatPrice(order.deliveryCharge || 0)}
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Total Items
                  </p>
                  <p className="text-purple-600 font-bold text-lg">
                    {order.items?.length || 0} items
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
