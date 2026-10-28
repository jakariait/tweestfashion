import React, { useEffect, useState } from 'react';
import { FaPlus, FaArrowRight } from 'react-icons/fa6';
import { FiMinus } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore.js';
import WishlistButton from './WishlistButton.jsx';
import OrderByPhoneWhatsapp from './OrderByPhoneWhatsapp.jsx';
import sanitizeHtml from '../../utils/sanitizeHtml.js';

const ProductAddToCart = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 5; // Set the limit for Cart Quantity
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [validationMessage, setValidationMessage] = useState(''); // New state for validation messages

  // Effect 1: Initialize selectedOptions and handle single variant product auto-selection
  useEffect(() => {
    setSelectedOptions({});
    setValidationMessage(''); // Clear message on product change

    if (product?.variants?.length === 1) {
      const singleVariant = product.variants[0];
      const initialSelected = {};
      singleVariant?.attributes?.forEach((attr) => {
        if (attr?.option?.name) {
          initialSelected[attr?.option?.name] = attr.value;
        }
      });
      setSelectedOptions(initialSelected);
      setSelectedVariant(singleVariant);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  // Effect 2: Main logic for updating options and variant selection
  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) {
      setOptions([]);
      setSelectedVariant(null);
      return;
    }

    // If single variant product, options are already set by Effect 1.
    if (
      product.variants.length === 1 &&
      Object.keys(selectedOptions).length > 0
    ) {
      const singleVariant = product.variants[0];
      const allOptionsMap = new Map();
      singleVariant?.attributes?.forEach((attr) => {
        if (!allOptionsMap.has(attr?.option?.name)) {
          allOptionsMap.set(attr?.option?.name, new Set());
        }
        allOptionsMap.get(attr?.option?.name).add(attr.value);
      });
      const allOptions = Array.from(allOptionsMap.keys()).map((name) => ({
        name,
        values: Array.from(allOptionsMap.get(name)),
      }));
      const displayedOptions = allOptions.map((option) => ({
        name: option.name,
        values: option.values.map((value) => ({ value, available: true })),
      }));
      setOptions(displayedOptions);
      return;
    }

    const allOptionsMap = new Map();
    product.variants.forEach((variant) => {
      variant?.attributes?.forEach((attr) => {
        if (!allOptionsMap.has(attr?.option?.name)) {
          allOptionsMap.set(attr?.option?.name, new Set());
        }
        allOptionsMap.get(attr?.option?.name).add(attr.value);
      });
    });

    const allOptions = Array.from(allOptionsMap.keys()).map((name) => ({
      name,
      values: Array.from(allOptionsMap.get(name)),
    }));

    const displayedOptions = allOptions.map((option, index) => {
      const isOptionGroupEnabled = allOptions
        .slice(0, index)
        .every((prevOption) => selectedOptions[prevOption.name]);

      if (!isOptionGroupEnabled) {
        return {
          name: option.name,
          values: option.values.map((value) => ({ value, available: false })), // All disabled
        };
      }

      const availableValues = new Set();
      const previousOptionNames = allOptions.slice(0, index).map((o) => o.name);

      product.variants.forEach((variant) => {
        const matchesPrevious = previousOptionNames.every((prevOptionName) => {
          const selectedValue = selectedOptions[prevOptionName];
          return variant?.attributes?.some(
            (attr) =>
              attr?.option?.name === prevOptionName &&
              attr.value === selectedValue,
          );
        });

        if (matchesPrevious) {
          const attr = variant?.attributes?.find(
            (a) => a.option.name === option.name,
          );
          if (attr) {
            availableValues.add(attr.value);
          }
        }
      });

      return {
        name: option.name,
        values: option.values.map((value) => ({
          value,
          available: availableValues.has(value),
        })),
      };
    });
    setOptions(displayedOptions);

    if (Object.keys(selectedOptions).length === allOptions.length) {
      const newVariant = product.variants.find((variant) =>
        Object.entries(selectedOptions).every(([key, value]) =>
          variant?.attributes?.some(
            (attr) => attr?.option?.name === key && attr.value === value,
          ),
        ),
      );
      setSelectedVariant(newVariant);
      setValidationMessage(''); // Clear validation message
    } else {
      setSelectedVariant(null);
      setValidationMessage('Please select all variant options.'); // Set validation message
    }
  }, [product, selectedOptions]);

  const handleOptionChange = (optionName, value) => {
    const allOptionNames = options.map((o) => o.name);
    const optionIndex = allOptionNames.indexOf(optionName);

    const newSelected = { [optionName]: value };

    for (let i = 0; i < optionIndex; i++) {
      const prevOptionName = allOptionNames[i];
      newSelected[prevOptionName] = selectedOptions[prevOptionName];
    }

    setSelectedOptions(newSelected);
    setValidationMessage(''); // Clear message on selection change
  };

  const handleAddToCart = (e) => {
    if (product.variants?.length > 0 && !selectedVariant) {
      const requiredOptions = options.map((o) => o.name);
      const missingOptions = requiredOptions.filter(
        (opt) => !selectedOptions[opt],
      );
      if (missingOptions.length > 0) {
        setValidationMessage(`${missingOptions.join(' / ')} required!`);
      } else if (product.variants?.length > 0) {
        setValidationMessage('Please select all variant options.');
      }
      return;
    }
    addToCart(product, quantity, selectedVariant);
    setValidationMessage(''); // Clear message on success

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BDT',
        value:
          selectedVariant?.discount > 0
            ? selectedVariant.discount * quantity
            : selectedVariant?.price
              ? selectedVariant.price * quantity
              : product.finalDiscount > 0
                ? product.finalDiscount * quantity
                : product.finalPrice * quantity,
        items: [
          {
            item_id: product.productId,
            item_name: product.name,
            currency: 'BDT',
            discount:
              selectedVariant?.discount > 0
                ? selectedVariant.price - selectedVariant.discount
                : product.finalPrice - product.finalDiscount,
            item_variant: selectedVariant
              ? (selectedVariant?.attributes?.map((a) => a.value).join('/') ??
                'Default')
              : 'Default',
            price:
              selectedVariant?.discount > 0
                ? selectedVariant.discount
                : selectedVariant?.price ||
                  product.finalDiscount ||
                  product.finalPrice,
            quantity,
          },
        ],
      },
    });
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < MAX_QUANTITY) {
      setQuantity((prev) => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const formatPrice = (price) => {
    if (isNaN(price)) return price;
    return price.toLocaleString();
  };

  const cleanHtml = (html) => sanitizeHtml(html);

  const variantForPrice = selectedVariant || product.variants?.[0];

  const orderTotal =
    (selectedVariant?.discount > 0
      ? selectedVariant.discount
      : selectedVariant?.price
        ? selectedVariant.price
        : product.finalDiscount > 0
          ? product.finalDiscount
          : product.finalPrice) * quantity;

  return (
    <div className="flex flex-col gap-4 pt-1 md:pt-0">
      <h2 className="text-lg md:text-2xl font-semibold leading-tight text-gray-900">
        {product.name}
      </h2>

      {/* Price */}
      <div className="flex flex-col gap-1.5">
        {!product.variants?.length && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {product.finalDiscount > 0 ? (
              <>
                <span className="text-2xl md:text-3xl font-extrabold text-[#2E7D31] tabular-nums">
                  Tk. {formatPrice(Number(product.finalDiscount))}
                </span>
                <span className="text-sm md:text-base text-gray-400 line-through tabular-nums">
                  Tk. {formatPrice(Number(product.finalPrice))}
                </span>
                <span className="rounded-full bg-[#2E7D31]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2E7D31]">
                  Save Tk{' '}
                  {formatPrice(
                    Number(product.finalPrice - product.finalDiscount),
                  )}
                </span>
              </>
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold text-gray-900 tabular-nums">
                Tk. {formatPrice(Number(product.finalPrice))}
              </span>
            )}
          </div>
        )}

        {variantForPrice && (
          <div className="flex items-center gap-2 flex-wrap">
            {variantForPrice.discount > 0 ? (
              <>
                <span className="text-xl md:text-2xl font-extrabold text-[#2E7D31] tabular-nums">
                  Tk. {formatPrice(Number(variantForPrice.discount))}
                </span>
                <span className="text-sm text-gray-400 line-through tabular-nums">
                  Tk. {formatPrice(Number(variantForPrice.price))}
                </span>
                <span className="rounded-full bg-[#2E7D31]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2E7D31]">
                  Save Tk{' '}
                  {formatPrice(
                    Number(variantForPrice.price - variantForPrice.discount),
                  )}
                </span>
              </>
            ) : (
              <span className="text-xl md:text-2xl font-extrabold text-gray-900 tabular-nums">
                Tk. {formatPrice(Number(variantForPrice.price))}
              </span>
            )}
          </div>
        )}

        {product.freeShipping && (
          <p className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#2E7D31]">
            <FaTruck className="rotate-y-180 shrink-0" />
            <span className="font-bold">Free Shipping</span>
            <span className="hidden sm:inline text-[#2E7D31]/70">
              on this product
            </span>
          </p>
        )}
      </div>

      {/* Info chips */}
      {(product.productCode || product.rewardPoints) && (
        <div className="flex flex-wrap gap-2">
          {product.productCode && (
            <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs md:text-sm text-gray-700">
              <strong>Code:</strong> {product.productCode}
            </span>
          )}
          {product.rewardPoints && (
            <span className="rounded-lg bg-[#F4FAF4] border border-[#2E7D31]/15 px-3 py-1.5 text-xs md:text-sm text-[#2E7D31]">
              Earn {product.rewardPoints} points
            </span>
          )}
        </div>
      )}

      {/* Variant options */}
      {!selectedVariant && product.variants?.length > 0 && (
        <div className="text-sm text-red-500">
          {validationMessage || 'Select options to see price.'}
        </div>
      )}

      {options.map((option) => (
        <div key={option.name} className="flex flex-col gap-1.5">
          <h3 className=" font-semibold uppercase tracking-wide text-gray-500">
            {option.name}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {option.values.map(({ value, available }) => {
              const isSelected = selectedOptions[option.name] === value;
              return (
                <button
                  key={value}
                  onClick={() => handleOptionChange(option.name, value)}
                  disabled={!available}
                  className={`rounded-full border px-3.5 py-1.5  font-medium transition-all duration-200 ${
                    isSelected
                      ? 'border-[#2E7D31] bg-[#2E7D31] text-white shadow-sm'
                      : available
                        ? 'border-gray-200 bg-white text-gray-700 hover:border-[#2E7D31]/50 hover:bg-[#F4FAF4]'
                        : 'border-gray-100 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quantity + Cart */}
      <div className="flex flex-wrap gap-2.5 md:gap-3 items-center mt-1">
        <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shrink-0">
          <button
            className="px-3 py-2.5 md:py-3 text-gray-600 hover:bg-[#F4FAF4] hover:text-[#2E7D31] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => handleQuantityChange('decrease')}
            disabled={
              product.variants?.length > 0 &&
              (!selectedVariant || selectedVariant.stock === 0)
            }
            aria-label="Decrease quantity"
          >
            <FiMinus />
          </button>
          <span className="px-4 text-sm md:text-base font-semibold tabular-nums text-gray-900">
            {quantity}
          </span>
          <button
            className="px-3 py-2.5 md:py-3 text-gray-600 hover:bg-[#F4FAF4] hover:text-[#2E7D31] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => handleQuantityChange('increase')}
            disabled={
              (product.variants?.length > 0 && !selectedVariant) ||
              quantity >= MAX_QUANTITY ||
              selectedVariant?.stock === 0
            }
            aria-label="Increase quantity"
          >
            <FaPlus />
          </button>
        </div>
        {selectedVariant?.stock === 0 ? (
          <button
            className="flex-1 min-w-[140px] rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold text-red-600 cursor-not-allowed"
            disabled
          >
            Stock Out
          </button>
        ) : (
          <button
            className="primaryBgColor accentTextColor flex-1 min-w-[140px] rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold cursor-pointer transition-transform duration-200 hover:opacity-90 active:scale-[0.98]"
            onClick={(e) => handleAddToCart(e)}
          >
            ADD TO CART
          </button>
        )}
        <WishlistButton
          product={product}
          className={
            'primaryBgColor accentTextColor rounded-xl px-3 py-2.5 shrink-0'
          }
        />
      </div>

      {/* Order Now */}
      {selectedVariant?.stock !== 0 && (
        <button
          type="button"
          className="group relative w-full overflow-hidden primaryBgColor accentTextColor rounded-xl px-4 py-3 md:py-3.5 cursor-pointer text-left transition-transform duration-200 active:scale-[0.98] animate-cod-glow"
          onClick={() => {
            if (product.variants?.length > 0 && !selectedVariant) {
              const requiredOptions = options.map((o) => o.name);
              const missingOptions = requiredOptions.filter(
                (opt) => !selectedOptions[opt],
              );
              if (missingOptions.length > 0) {
                setValidationMessage(`${missingOptions.join(' / ')} required!`);
              } else if (product.variants?.length > 0) {
                setValidationMessage('Please select all variant options.');
              }
              return;
            }
            addToCart(product, quantity, selectedVariant);
            navigate('/checkout');
            setValidationMessage('');
          }}
        >
          <span className="cod-shimmer" aria-hidden="true" />
          <span className="relative z-10 flex items-center justify-between gap-3">
            <span className="flex flex-col min-w-0">
              <span className="text-base md:text-lg font-bold leading-tight">
                Order Now
              </span>
              <span className="text-xs leading-tight opacity-85">
                Cash on Delivery · Pay when you receive
              </span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="rounded-full  p-1.5 transition-transform duration-200 group-hover:translate-x-0.5">
                <FaArrowRight className="text-xs md:text-sm" />
              </span>
            </span>
          </span>
        </button>
      )}

      <OrderByPhoneWhatsapp
        product={product}
        quantity={quantity}
        price={orderTotal}
        selectedVariant={selectedVariant}
      />
    </div>
  );
};

export default ProductAddToCart;
