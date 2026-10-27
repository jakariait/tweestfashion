import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PackageCheck,
  MapPin,
  Phone,
  Mail,
  Package,
  Calendar,
  Truck,
  ArrowRight,
} from 'lucide-react';
import axios from 'axios';
import generalInfoStore from '../../store/GeneralInfoStore.js';
import sanitizeHtml from '../../utils/sanitizeHtml.js';

const ThankYou = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageUrl = `${apiUrl.replace('/api', '')}/uploads`;

  const { GeneralInfoList } = generalInfoStore();

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

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${apiUrl}/order-no/${orderId}`);
        if (res.data.success) {
          const order = res.data.order;
          setOrder(order);

          window.dataLayer = window.dataLayer || [];

          // 🕒 Delay the push to allow GTM to be ready
          setTimeout(() => {
            window.dataLayer.push({
              event: 'purchase',

              user: {
                name: order.shippingInfo.fullName || '',
                email: order.shippingInfo.email || '',
                phone: order.shippingInfo.mobileNo || '',
                address: order.shippingInfo.address || '',
              },

              ecommerce: {
                transaction_id: order.orderNo,
                currency: 'BDT',
                value: order.totalAmount,
                tax: order.vat,
                shipping: order.deliveryCharge,
                coupon: order.promoCode || '',
                items: order.items.map((item) => ({
                  item_name: item.productId?.name || 'Unknown Product',
                  item_id: item.productId?.productId || 'N/A',
                  price: item.price,
                  quantity: item.quantity,
                  item_variant: item.variantId || 'Default',
                  item_category: item.productId?.category?.name || 'N/A',
                  item_image: item.productId?.thumbnailImage || '',
                  item_size: getVariantDisplayName(
                    item.productId?.variants?.find(
                      (variant) => variant._id === item.variantId,
                    ),
                  ),
                })),
              },
            });
          }, 200);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, apiUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Order not found</p>
          <Link
            to="/"
            className="inline-block primaryBgColor accentTextColor px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full blur opacity-75"></div>
              <PackageCheck className="relative text-green-600" size={80} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Order Received!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Thank you for your purchase. We're preparing your order.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Order & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Number Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Order Number
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    #{order?.orderNo}
                  </p>
                </div>
                <Calendar className="text-gray-400" size={32} />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Order placed on{' '}
                {new Date(order?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-1 h-6 bg-blue-600 rounded mr-3"></div>
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <p className="text-gray-600 text-sm font-medium">Full Name</p>
                  <p className="text-gray-900 font-semibold mt-2">
                    {order?.shippingInfo?.fullName}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-gray-600 text-sm font-medium flex items-center">
                    <Mail size={16} className="mr-2 text-blue-600" />
                    Email Address
                  </p>
                  <p className="text-gray-900 font-semibold mt-2 break-all">
                    {order?.shippingInfo?.email}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-gray-600 text-sm font-medium flex items-center">
                    <Phone size={16} className="mr-2 text-blue-600" />
                    Phone Number
                  </p>
                  <p className="text-gray-900 font-semibold mt-2">
                    {order?.shippingInfo?.mobileNo}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
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
                    {order?.shippingInfo?.fullName}
                  </p>
                  <p className="text-gray-700 mt-1">
                    {order?.shippingInfo?.address}
                  </p>
                  <p className="text-gray-700">
                    {order?.shippingInfo?.city}
                    {order?.shippingInfo?.state &&
                      `, ${order.shippingInfo.state}`}
                    {order?.shippingInfo?.postalCode &&
                      `, ${order.shippingInfo.postalCode}`}
                  </p>
                  <p className="text-gray-700">
                    {order?.shippingInfo?.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Truck size={20} className="mr-2 text-blue-600" />
                Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Shipping Method</p>
                  <p className="text-gray-900 font-semibold capitalize">
                    {order?.deliveryType || 'Standard Delivery'}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">Delivery Charge</p>
                  <p className="text-gray-900 font-semibold">
                    ৳ {order?.deliveryCharge?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Package size={20} className="mr-2 text-blue-600" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {order?.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium text-sm">
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
                      ৳ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-semibold">
                    ৳{' '}
                    {(
                      order?.totalAmount -
                      order?.vat -
                      order?.deliveryCharge
                    ).toFixed(2)}
                  </span>
                </div>

                {order?.vat > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (VAT)</span>
                    <span className="text-gray-900 font-semibold">
                      ৳ {order?.vat?.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-semibold">
                    ৳ {order?.deliveryCharge?.toFixed(2)}
                  </span>
                </div>

                {order?.promoCode && (
                  <div className="flex justify-between text-sm bg-green-50 p-2 rounded">
                    <span className="text-gray-600">
                      Promo Code ({order?.promoCode})
                    </span>
                    <span className="text-green-600 font-semibold">
                      -৳ {order?.discount?.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-gray-900 font-bold">Total Amount</span>
                  <span className="text-xl font-bold text-green-600">
                    ৳ {order?.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Detailed */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Items</h2>
          <div className="space-y-6">
            {order?.items?.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
              >
                {/* Product Image */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {item.productId?.thumbnailImage ? (
                    <img
                      src={`${imageUrl}/${item.productId.thumbnailImage}`}
                      alt={item.productId?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Package size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="text-gray-900 font-bold mb-2">
                    {item.productId?.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
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

                  <div className="flex flex-wrap gap-4 text-sm">
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
                        ৳ {item.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-2">Item Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    ৳ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/track-order"
            className="flex items-center justify-center gap-2 primaryBgColor accentTextColor px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            <Truck size={20} />
            Track My Order
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Back to Home
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-2">Have questions about your order?</p>
          <p className="text-gray-600 text-sm">
            Contact our customer support team at{' '}
            <a
              href={`mailto:${GeneralInfoList?.CompanyEmail?.[0] || 'support@example.com'}`}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
            >
              {GeneralInfoList?.CompanyEmail?.[0] || 'support@example.com'}
            </a>{' '}
            or call{' '}
            <a
              href={`tel:${GeneralInfoList?.PhoneNumber?.[0]?.replace(/\D/g, '') || '+880'}`}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
            >
              {GeneralInfoList?.PhoneNumber?.[0] || '+880-XXXX-XXXX'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
