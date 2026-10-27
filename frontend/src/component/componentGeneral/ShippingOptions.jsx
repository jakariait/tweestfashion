// ShippingOptions.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useCartStore from '../../store/useCartStore.js';

const ShippingOptions = ({ onShippingChange }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { cart } = useCartStore();

  const [shipping, setShipping] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const hasFreeShippingProduct = cart.some((item) => item.freeShipping);

  // Fetch shipping options
  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await axios.get(`${apiUrl}/getAllShipping`);
        if (res.data.success) {
          setShipping(res.data.data);
          setMessage(res.data.message);
        } else {
          setMessage('Failed to fetch shipping options.');
        }
      } catch (err) {
        setMessage('An error occurred while fetching shipping options.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipping();
  }, []);

  // Set default shipping option
  useEffect(() => {
    if (shipping.length > 0) {
      const defaultOption = shipping[0];
      const shippingValue = hasFreeShippingProduct
        ? 0
        : (defaultOption?.value ?? 0);
      setSelectedShipping(shippingValue);
      onShippingChange({
        name: hasFreeShippingProduct
          ? 'Free Shipping'
          : (defaultOption?.name ?? ''),
        value: shippingValue,
        id: defaultOption?._id,
      });
    }
  }, [shipping, hasFreeShippingProduct]);

  const handleChange = (option) => {
    const shippingValue = hasFreeShippingProduct ? 0 : option.value;
    setSelectedShipping(shippingValue);
    onShippingChange({
      name: hasFreeShippingProduct ? 'Free Shipping' : option.name,
      value: shippingValue,
      id: option._id,
    });
  };

  return (
    <div className={'flex flex-col gap-4'}>
      <h1 className="border-l-4 primaryBorderColor primaryTextColor pl-2 text-lg font-semibold">
        Select Shipping Option
      </h1>

      {loading ? (
        <div className="text-gray-500">Loading shipping options...</div>
      ) : message && shipping.length === 0 ? (
        <div className="text-red-500">{message}</div>
      ) : hasFreeShippingProduct ? (
        <div className="w-full border border-green-500 bg-green-50 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                checked={true}
                readOnly
                className="primaryAccentColor w-5 h-5"
              />
              <span className="font-medium text-green-700">Free Shipping</span>
            </div>
            <span className="font-medium text-green-700">Tk. 0</span>
          </div>
        </div>
      ) : (
        shipping.map((option, index) => (
          <label
            key={index}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 cursor-pointer transition duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={option.value}
                  checked={selectedShipping === option.value}
                  onChange={() => handleChange(option)}
                  className="primaryAccentColor w-5 h-5"
                />
                {option.name}
              </div>
              <div>Tk. {option.value}</div>
            </div>
          </label>
        ))
      )}
    </div>
  );
};

export default ShippingOptions;
