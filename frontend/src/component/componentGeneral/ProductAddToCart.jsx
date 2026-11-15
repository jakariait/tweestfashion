import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaArrowRight, FaXmark } from 'react-icons/fa6';
import { FiMinus } from 'react-icons/fi';
import { FaTruck } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore.js';
import WishlistButton from './WishlistButton.jsx';
import OrderByPhoneWhatsapp from './OrderByPhoneWhatsapp.jsx';
import ProductBrand from '@/component/componentGeneral/ProductBrand.jsx';

const resolveVariantSelection = (comboProduct, selections) => {
  const variants = comboProduct?.variants || [];
  if (variants.length === 0) return null;
  const optionNames = Array.from(
    new Set(
      variants.flatMap(
        (variant) =>
          variant?.attributes
            ?.map((attr) => attr?.option?.name)
            .filter(Boolean) || [],
      ),
    ),
  );
  if (optionNames.some((name) => !selections?.[name])) return null;
  return (
    variants.find((variant) =>
      optionNames.every((name) =>
        variant?.attributes?.some(
          (attr) =>
            attr?.option?.name === name && attr.value === selections[name],
        ),
      ),
    ) || null
  );
};

// How many units of a variant's option value may be selected. Each option
// value carries `numberOfProduct`; the most restrictive attribute wins.
const getVariantProductLimit = (comboProduct, selections) => {
  const variant = resolveVariantSelection(comboProduct, selections);
  if (!variant) return Infinity;

  let limit = Infinity;
  variant.attributes?.forEach((attr) => {
    const optionValues = attr?.option?.values || [];
    const match = optionValues.find((value) =>
      typeof value === 'object'
        ? value?.value === attr.value
        : value === attr.value,
    );
    if (match && typeof match === 'object') {
      const count = Number(match.numberOfProduct);
      if (Number.isFinite(count) && count > 0) {
        limit = Math.min(limit, count);
      }
    }
  });
  return limit;
};

const getVariantLabel = (variant) =>
  variant?.attributes
    ?.map((attr) =>
      attr?.option?.name
        ? `${attr.option.name}: ${attr.value}`
        : String(attr?.value ?? ''),
    )
    .filter(Boolean)
    .join(' / ') || 'Default';

const ProductAddToCart = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 5; // Set the limit for Cart Quantity
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageUrl = `${apiUrl.replace('/api', '')}/uploads`;

  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [validationMessage, setValidationMessage] = useState(''); // New state for validation messages
  const [comboPicks, setComboPicks] = useState([]);
  const [comboValidation, setComboValidation] = useState('');
  const [comboPickerSlot, setComboPickerSlot] = useState(null);
  const [comboPickerSearch, setComboPickerSearch] = useState('');
  const [comboPickerProduct, setComboPickerProduct] = useState(null);

  const comboItems = useMemo(
    () =>
      product?.isCombo && Array.isArray(product.comboProducts)
        ? product.comboProducts.filter(
            (comboProduct) =>
              comboProduct &&
              typeof comboProduct === 'object' &&
              comboProduct._id,
          )
        : [],
    [product],
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
      setSelectedVariant(singleVariant);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  // How many products the selected combo pack allows (numberOfProduct on the
  // combo product's own variant). Combos without pack variants include every
  // bundled product once.
  const comboPickCount = useMemo(() => {
    if (!product?.isCombo || comboItems.length === 0) return 0;
    if (product.variants?.length > 0) {
      const limit = getVariantProductLimit(product, selectedOptions);
      return Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 0;
    }
    return comboItems.length;
  }, [product, comboItems, selectedOptions]);

  const comboRequiredCount = Math.min(comboPickCount, comboItems.length);

  // Combos without pack variants start with every bundled product selected;
  // pack combos start with empty slots and the customer fills the permitted
  // number of items.
  useEffect(() => {
    if (comboPickCount === 0) {
      setComboPicks([]);
      return;
    }

    setComboPicks(
      product?.variants?.length > 0
        ? Array.from({ length: comboRequiredCount }, () => null)
        : comboItems.slice(0, comboRequiredCount).map((item) => ({
            productId: item._id,
            variantId: null,
          })),
    );
    setComboPickerSlot(null);
    setComboPickerProduct(null);
    setComboValidation('');
  }, [comboPickCount, comboRequiredCount, comboItems, product]);

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

  const openComboPicker = (slotIndex) => {
    setComboPickerSlot(slotIndex);
    setComboPickerSearch('');
    setComboPickerProduct(null);
    setComboValidation('');
  };

  const closeComboPicker = () => {
    setComboPickerSlot(null);
    setComboPickerSearch('');
    setComboPickerProduct(null);
  };

  const handleComboPickSelect = (slotProduct, variant = null) => {
    if (comboPickerSlot === null) return;
    setComboPicks((prev) => {
      const next = [...prev];
      next[comboPickerSlot] = {
        productId: slotProduct._id,
        variantId: variant?._id || null,
      };
      return next;
    });
    closeComboPicker();
  };

  // Products with variants require an explicit variant choice before they are
  // added to a combo slot; products without variants are added directly.
  const handleComboPickerProductClick = (slotProduct) => {
    if (slotProduct.variants?.length > 0) {
      setComboPickerProduct(slotProduct);
      return;
    }
    handleComboPickSelect(slotProduct, null);
  };

  const handleComboPickClear = (slotIndex) => {
    setComboPicks((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setComboValidation('');
  };

  const handleComboPickVariantChange = (slotIndex, variantId) => {
    setComboPicks((prev) => {
      const next = [...prev];
      if (next[slotIndex]) {
        next[slotIndex] = { ...next[slotIndex], variantId };
      }
      return next;
    });
    setComboValidation('');
  };

  const getPickProduct = (pick) =>
    comboItems.find((item) => String(item._id) === String(pick?.productId));

  const getPickVariant = (pick, slotProduct) =>
    slotProduct?.variants?.find(
      (variant) => String(variant._id) === String(pick?.variantId),
    ) || null;

  // Combine identical product + variant picks into one cart line, since the
  // customer may pick the same bundled product more than once.
  const getComboSelectionsPayload = () => {
    const grouped = new Map();

    comboPicks.forEach((pick) => {
      const slotProduct = getPickProduct(pick);
      if (!slotProduct) return;

      const variant = getPickVariant(pick, slotProduct);
      if (slotProduct.variants?.length > 0 && !variant) return;

      const variantId = variant?._id || null;
      const key = `${slotProduct._id}:${variantId || 'Default'}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.quantity += 1;
        return;
      }

      grouped.set(key, {
        productId: slotProduct._id,
        variantId,
        name: slotProduct.name,
        variant: getVariantLabel(variant),
        quantity: 1,
      });
    });

    return [...grouped.values()];
  };

  const validateComboSelection = () => {
    if (!product?.isCombo || comboItems.length === 0) return true;

    if (product.variants?.length > 0 && !selectedVariant) {
      setComboValidation('Select a combo pack option first.');
      return false;
    }

    if (comboPickCount === 0 || !comboPicks.some(Boolean)) {
      setComboValidation('Select the products for this combo.');
      return false;
    }

    const selectedPickCount = comboPicks.filter(Boolean).length;
    if (selectedPickCount !== comboRequiredCount) {
      setComboValidation(
        `Select ${comboRequiredCount} product${comboRequiredCount > 1 ? 's' : ''} (${selectedPickCount} selected).`,
      );
      return false;
    }

    const counts = new Map();
    for (let index = 0; index < comboPicks.length; index += 1) {
      const pick = comboPicks[index];
      const slotProduct = getPickProduct(pick);
      if (!slotProduct) {
        setComboValidation(`Choose a product for item ${index + 1}.`);
        return false;
      }

      const variant = getPickVariant(pick, slotProduct);
      if (slotProduct.variants?.length > 0 && !variant) {
        setComboValidation(`Choose a variant for item ${index + 1}.`);
        return false;
      }

      const key = `${slotProduct._id}:${variant?._id || 'Default'}`;
      const existing = counts.get(key);
      if (existing) {
        existing.quantity += 1;
      } else {
        counts.set(key, { slotProduct, variant, quantity: 1 });
      }
    }

    for (const { slotProduct, variant, quantity } of counts.values()) {
      if (slotProduct.variants?.length > 0) {
        if (!variant || variant.stock < quantity) {
          const label = getVariantLabel(variant);
          setComboValidation(
            variant?.stock > 0
              ? `Only ${variant.stock} left of ${slotProduct.name} (${label}).`
              : `${slotProduct.name} (${label}) is out of stock.`,
          );
          return false;
        }
      } else if (Number(slotProduct.finalStock || 0) < quantity) {
        setComboValidation(
          Number(slotProduct.finalStock || 0) > 0
            ? `Only ${slotProduct.finalStock} left for ${slotProduct.name}.`
            : `${slotProduct.name} is out of stock.`,
        );
        return false;
      }
    }

    setComboValidation('');
    return true;
  };

  const comboAvailableStock = (() => {
    if (!product?.isCombo || comboItems.length === 0) return null;
    if (!comboPicks.some(Boolean)) return null;

    const entries = getComboSelectionsPayload();
    if (entries.length === 0) return null;

    const availablePerEntry = entries.map((entry) => {
      const comboProduct = comboItems.find(
        (item) => String(item._id) === String(entry.productId),
      );
      if (!comboProduct) return 0;

      if (entry.variantId) {
        const variant = (comboProduct.variants || []).find(
          (item) => String(item._id) === String(entry.variantId),
        );
        return variant
          ? Math.floor(Number(variant.stock || 0) / entry.quantity)
          : 0;
      }
      return Math.floor(Number(comboProduct.finalStock || 0) / entry.quantity);
    });

    return Math.min(...availablePerEntry);
  })();

  const comboSelectedCount = comboPicks.filter(Boolean).length;
  const comboSelectionComplete =
    comboRequiredCount > 0 && comboSelectedCount === comboRequiredCount;

  // Only report a stock-out once a real selection has been made. Before that
  // there is nothing to check, so the buttons stay actionable and validation
  // asks the customer to choose instead.
  const variantStockOut =
    product.variants?.length > 0 &&
    Boolean(selectedVariant) &&
    Number(selectedVariant.stock) === 0;

  const comboStockOut =
    product?.isCombo &&
    comboItems.length > 0 &&
    comboSelectionComplete &&
    Number.isFinite(comboAvailableStock) &&
    comboAvailableStock === 0;

  const comboPickerItems = comboItems.filter((item) =>
    String(item.name || '')
      .toLowerCase()
      .includes(comboPickerSearch.trim().toLowerCase()),
  );

  const handleAddToCart = () => {
    if (product.isCombo && !validateComboSelection()) return;

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
    addToCart(
      product,
      quantity,
      selectedVariant,
      product.isCombo ? getComboSelectionsPayload() : null,
    );
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

  const variantForPrice = selectedVariant || product.variants?.[0];

  const orderTotal =
    (selectedVariant?.discount > 0
      ? selectedVariant.discount
      : selectedVariant?.price
        ? selectedVariant.price
        : product.finalDiscount > 0
          ? product.finalDiscount
          : product.finalPrice) * quantity;

  console.log(product);
  return (
    <div className="flex flex-col gap-4 pt-1 md:pt-0">
      {/*Product Brand*/}
      <ProductBrand product={product} />

      {/*Product Name*/}
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

      {comboItems.length > 0 && (
        <div className="space-y-3 rounded-xl border border-gray-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold uppercase tracking-wide primaryTextColor">
              Build your combo
            </h3>
            {comboPickCount > 0 && (
              <span className="rounded-full bg-[#F4FAF4] px-2.5 py-0.5 text-xs font-semibold text-[#2E7D31]">
                {comboSelectedCount} / {comboRequiredCount} selected
              </span>
            )}
          </div>

          {product.variants?.length > 0 && !selectedVariant ? (
            <p className="text-sm text-gray-500">
              Select a combo pack option above to choose your products.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                Pick {comboRequiredCount} product
                {comboRequiredCount > 1 ? 's' : ''} from {comboItems.length}{' '}
                available item{comboItems.length > 1 ? 's' : ''}.
              </p>

              <div className="grid grid-cols-1 gap-2 ">
                {Array.from({ length: comboRequiredCount }).map(
                  (_, slotIndex) => {
                    const pick = comboPicks[slotIndex];
                    const slotProduct = pick ? getPickProduct(pick) : null;

                    if (!slotProduct) {
                      return (
                        <button
                          key={slotIndex}
                          type="button"
                          onClick={() => openComboPicker(slotIndex)}
                          className="flex min-h-[108px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-2 py-3 text-center transition-colors hover:border-[#2E7D31]/50 hover:bg-[#F4FAF4]"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#2E7D31] shadow-sm">
                            <FaPlus className="text-xs" />
                          </span>
                          <span className="text-xs font-semibold text-gray-700">
                            Select product
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Item {slotIndex + 1}
                          </span>
                        </button>
                      );
                    }

                    return (
                      <div
                        key={slotIndex}
                        className="flex min-h-[108px] flex-col rounded-lg border border-[#2E7D31]/40 bg-white p-2"
                      >
                        <div className="flex items-start gap-2">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-50">
                            {slotProduct.thumbnailImage ? (
                              <img
                                src={`${imageUrl}/${slotProduct.thumbnailImage}`}
                                alt={slotProduct.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Item {slotIndex + 1}
                            </p>
                            <p className="line-clamp-2 text-xs font-medium text-gray-900">
                              {slotProduct.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleComboPickClear(slotIndex)}
                            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                            aria-label={`Remove item ${slotIndex + 1}`}
                          >
                            <FaXmark className="text-xs" />
                          </button>
                        </div>

                        {slotProduct.variants?.length > 0 && (
                          <select
                            value={pick.variantId || ''}
                            onChange={(e) =>
                              handleComboPickVariantChange(
                                slotIndex,
                                e.target.value,
                              )
                            }
                            className="mt-2 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-[#2E7D31] focus:outline-none"
                          >
                            <option value="" disabled>
                              Select variant
                            </option>
                            {slotProduct.variants.map((itemVariant) => (
                              <option
                                key={itemVariant._id}
                                value={itemVariant._id}
                                disabled={Number(itemVariant.stock || 0) === 0}
                              >
                                {getVariantLabel(itemVariant)}
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          type="button"
                          onClick={() => openComboPicker(slotIndex)}
                          className="mt-auto self-start pt-2 text-[11px] font-semibold text-[#2E7D31] underline-offset-2 hover:underline"
                        >
                          Change product
                        </button>
                      </div>
                    );
                  },
                )}
              </div>
            </>
          )}

          {comboValidation && (
            <p className="text-sm text-red-500">{comboValidation}</p>
          )}
        </div>
      )}

      {comboPickerSlot !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Select a combo product"
          onClick={closeComboPicker}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">
                  {comboPickerProduct ? 'Select variant' : 'Select product'}
                </h3>
                <p className="truncate text-xs text-gray-500">
                  {comboPickerProduct
                    ? comboPickerProduct.name
                    : `Item ${comboPickerSlot + 1} of ${comboRequiredCount}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {comboPickerProduct && (
                  <button
                    type="button"
                    onClick={() => setComboPickerProduct(null)}
                    className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-[#2E7D31] transition-colors hover:bg-[#F4FAF4]"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeComboPicker}
                  className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                  aria-label="Close product picker"
                >
                  <FaXmark />
                </button>
              </div>
            </div>

            {comboPickerProduct ? (
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <p className="mb-2 text-xs text-gray-500">
                  Choose a variant to add this product to your combo.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {comboPickerProduct.variants?.map((itemVariant) => {
                    const isVariantOutOfStock =
                      Number(itemVariant.stock || 0) === 0;
                    return (
                      <button
                        key={itemVariant._id}
                        type="button"
                        disabled={isVariantOutOfStock}
                        onClick={() =>
                          handleComboPickSelect(comboPickerProduct, itemVariant)
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-medium text-gray-900 transition-colors hover:border-[#2E7D31]/60 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {getVariantLabel(itemVariant)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-2.5">
                  <input
                    type="search"
                    autoFocus
                    value={comboPickerSearch}
                    onChange={(e) => setComboPickerSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2E7D31] focus:outline-none"
                  />
                </div>

                <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto px-4 pb-4 sm:grid-cols-3">
                  {comboPickerItems.map((item) => {
                    const isOutOfStock =
                      item.variants?.length > 0
                        ? !item.variants.some(
                            (itemVariant) => Number(itemVariant.stock || 0) > 0,
                          )
                        : Number(item.finalStock || 0) === 0;

                    return (
                      <button
                        key={item._id}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleComboPickerProductClick(item)}
                        className="group overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-colors hover:border-[#2E7D31]/60 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <div className="h-24 w-full overflow-hidden bg-gray-50">
                          {item.thumbnailImage ? (
                            <img
                              src={`${imageUrl}/${item.thumbnailImage}`}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : null}
                        </div>
                        <div className="space-y-1 p-2">
                          <p className="line-clamp-2 break-words text-xs font-medium text-gray-900">
                            {item.name}
                          </p>
                          {isOutOfStock ? (
                            <p className="text-[10px] font-semibold uppercase text-red-500">
                              Out of stock
                            </p>
                          ) : item.variants?.length > 0 ? (
                            <p className="text-[10px] font-semibold uppercase text-[#2E7D31]">
                              Select variant
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}

                  {comboPickerItems.length === 0 && (
                    <p className="col-span-full py-6 text-center text-sm text-gray-500">
                      No products found.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
              variantStockOut ||
              comboStockOut ||
              (Number.isFinite(comboAvailableStock) &&
                quantity >= comboAvailableStock)
            }
            aria-label="Increase quantity"
          >
            <FaPlus />
          </button>
        </div>
        {variantStockOut || comboStockOut ? (
          <button
            className="flex-1 min-w-[140px] rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold text-red-600 cursor-not-allowed"
            disabled
          >
            Stock Out
          </button>
        ) : (
          <button
            className="primaryBgColor accentTextColor flex-1 min-w-[140px] rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold cursor-pointer transition-transform duration-200 hover:opacity-90 active:scale-[0.98]"
            onClick={handleAddToCart}
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
      {!variantStockOut && !comboStockOut && (
        <button
          type="button"
          className="group relative w-full overflow-hidden primaryBgColor accentTextColor rounded-xl px-4 py-3 md:py-3.5 cursor-pointer text-left transition-transform duration-200 active:scale-[0.98] animate-cod-glow"
          onClick={() => {
            if (product.isCombo && !validateComboSelection()) return;

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
            addToCart(
              product,
              quantity,
              selectedVariant,
              product.isCombo ? getComboSelectionsPayload() : null,
            );
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
