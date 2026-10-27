import React, { useCallback, useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { FiMinus } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore.js';
import WishlistButton from './WishlistButton.jsx';
import sanitizeHtml from '../../utils/sanitizeHtml.js';
import ProductBrand from '@/component/componentGeneral/ProductBrand.jsx';
import OrderByPhoneWhatsapp from '@/component/componentGeneral/OrderByPhoneWhatsapp.jsx';

const ProductAddToCart = ({ product, onVariantChange, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 5; // Set the limit for Cart Quantity
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [validationMessage, setValidationMessage] = useState(''); // New state for validation messages

  // Optional parent hook so e.g. the gallery can react to variant changes
  const handleVariantChange = useCallback(
    (variant) => {
      setSelectedVariant(variant);
      onVariantChange?.(variant);
    },
    [onVariantChange],
  );

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
      handleVariantChange(singleVariant);
    } else {
      handleVariantChange(null);
    }
  }, [product, handleVariantChange]);

  // Effect 2: Main logic for updating options and variant selection
  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) {
      setOptions([]);
      handleVariantChange(null);
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
      handleVariantChange(newVariant);
      setValidationMessage(''); // Clear validation message
    } else {
      handleVariantChange(null);
      setValidationMessage('Please select all variant options.'); // Set validation message
    }
  }, [product, selectedOptions, handleVariantChange]);

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

  const handleAddToCart = () => {
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
    onAddToCart?.();

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

  const unitPrice =
    variantForPrice?.discount > 0
      ? variantForPrice.discount
      : variantForPrice?.price || product.finalDiscount || product.finalPrice;
  const orderTotal = Number(unitPrice || 0) * quantity;

  return (
    <div>
      <div>
        <div className="flex flex-col gap-1.5 md:gap-3 pt-1 md:pt-0">
          {/*Brand  Button*/}
          <div className={'flex justify-between items-center'}>
            <ProductBrand product={product} />
          </div>
          <h2 className="text-base md:text-2xl leading-tight">
            {product.name}
          </h2>
          <div className="flex text-center flex-col gap-1 md:gap-2">
            {/* Without Variant Price Display */}
            {!product.variants?.length && (
              <div className="flex gap-2 items-center">
                {product.finalDiscount > 0 ? (
                  <>
                    <div className="line-through">
                      Tk. {formatPrice(Number(product.finalPrice))}
                    </div>
                    <div className="text-red-800">
                      Tk. {formatPrice(Number(product.finalDiscount))}
                    </div>
                    <div className="hidden sm:block">
                      You Save: Tk{' '}
                      {formatPrice(
                        Number(product.finalPrice - product.finalDiscount),
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-black font-medium">
                    Tk. {formatPrice(Number(product.finalPrice))}
                  </div>
                )}
              </div>
            )}

            {/*With Variant Price Display */}
            {variantForPrice && (
              <div className="flex gap-1 md:gap-2 flex-wrap">
                {variantForPrice.discount > 0 ? (
                  <>
                    <div className="line-through ">
                      Tk. {formatPrice(Number(variantForPrice.price))}
                    </div>
                    <div className="text-red-800 ">
                      Tk. {formatPrice(Number(variantForPrice.discount))}
                    </div>
                    <div className="hidden sm:block">
                      You Save: Tk{' '}
                      {formatPrice(
                        Number(
                          variantForPrice.price - variantForPrice.discount,
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-black">
                    Tk. {formatPrice(Number(variantForPrice.price))}
                  </div>
                )}
              </div>
            )}

            {product.freeShipping && (
              <p className="text-[#2E7D31] flex gap-1 items-center text-xs md:text-sm">
                <FaTruck className="rotate-y-180 shrink-0" />
                <span className="font-bold">Free Shipping</span>
                <span className="hidden sm:inline">on this product</span>
              </p>
            )}

            {product.productCode && (
              <div
                className={
                  'bg-gray-100 px-3 py-1.5 rounded text-sm md:text-base'
                }
              >
                <strong>Product Code:</strong> {product.productCode}
              </div>
            )}
            {product.rewardPoints && (
              <div
                className={
                  'bg-gray-100 px-3 py-1.5 rounded text-sm md:text-base'
                }
              >
                Purchase & Earn: {product.rewardPoints} points.
              </div>
            )}
          </div>

          {!selectedVariant && product.variants?.length > 0 && (
            <div className=" text-red-500">
              {validationMessage || 'Select options to see price.'}{' '}
            </div>
          )}

          {options.map((option) => (
            <div key={option.name} className={'flex flex-col gap-1'}>
              <h2 className="text-sm md:text-lg font-semibold">
                {option.name} :
              </h2>
              <div className="flex gap-2 flex-wrap ">
                {option.values.map(({ value, available }) => (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    disabled={!available}
                    className={`px-2 py-0.5 md:px-3 md:py-1 rounded text-xs md:text-sm transition-all duration-200 ${
                      selectedOptions[option.name] === value
                        ? 'primaryBgColor text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className={'flex flex-wrap gap-2 md:gap-4 items-center mt-2'}>
            <div
              className={'rounded flex items-center justify-between shrink-0'}
            >
              <button
                className={
                  'primaryBgColor accentTextColor px-2 py-2 md:py-3 rounded-l cursor-pointer'
                }
                onClick={() => handleQuantityChange('decrease')}
                disabled={
                  product.variants?.length > 0 &&
                  (!selectedVariant || selectedVariant.stock === 0)
                }
              >
                <FiMinus />
              </button>
              <span className={'px-3 py-1 md:py-2 bg-gray-200'}>
                {quantity}
              </span>
              <button
                className={
                  'primaryBgColor accentTextColor px-2 py-2 md:py-3 rounded-r cursor-pointer'
                }
                onClick={() => handleQuantityChange('increase')}
                disabled={
                  (product.variants?.length > 0 && !selectedVariant) ||
                  quantity >= MAX_QUANTITY ||
                  selectedVariant?.stock === 0
                }
              >
                <FaPlus />
              </button>
            </div>
            {selectedVariant?.stock === 0 ? (
              <button className="text-red-600 w-44 font-semibold" disabled>
                Stock Out
              </button>
            ) : (
              <button
                className="primaryBgColor accentTextColor px-2 py-1 md:py-2 rounded flex-1 min-w-[120px] cursor-pointer"
                onClick={handleAddToCart}
              >
                ADD TO CART
              </button>
            )}
            <WishlistButton
              product={product}
              className={'primaryBgColor accentTextColor px-2 py-1 shrink-0'}
            />
          </div>
          {selectedVariant?.stock !== 0 && (
            <div className={'flex items-center justify-center'}>
              <button
                className="primaryBgColor flex-1   accentTextColor px-2 py-1 md:py-2 rounded cursor-pointer"
                onClick={() => {
                  if (product.variants?.length > 0 && !selectedVariant) {
                    const requiredOptions = options.map((o) => o.name);
                    const missingOptions = requiredOptions.filter(
                      (opt) => !selectedOptions[opt],
                    );
                    if (missingOptions.length > 0) {
                      setValidationMessage(
                        `${missingOptions.join(' / ')} required!`,
                      );
                    } else if (product.variants?.length > 0) {
                      setValidationMessage(
                        'Please select all variant options.',
                      );
                    }
                    return;
                  }
                  addToCart(product, quantity, selectedVariant);
                  onAddToCart?.();
                  navigate('/checkout');
                  setValidationMessage('');
                }}
              >
                Order With Cash On Delivery
              </button>
            </div>
          )}
        </div>
      </div>

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
