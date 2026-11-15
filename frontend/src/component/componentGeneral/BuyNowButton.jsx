import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DialogActions } from '@/components/ui/dialog-actions';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import { FiMinus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore.js';

const getVariantLabel = (variant) =>
  variant?.attributes
    ?.map((attr) =>
      attr?.option?.name
        ? `${attr.option.name}: ${attr.value}`
        : String(attr?.value ?? ''),
    )
    .filter(Boolean)
    .join(' / ') || 'Default';

// How many bundled products a combo pack variant allows. Each option value
// carries `numberOfProduct`; the most restrictive attribute wins.
const getVariantProductLimit = (variant, fallback) => {
  if (!variant) return 0;
  let limit = Infinity;
  variant.attributes?.forEach((attr) => {
    const values = attr?.option?.values || [];
    const match = values.find((value) =>
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
  return Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : fallback;
};

const BuyNowButton = ({ product, isAddToCart = false }) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [comboPicks, setComboPicks] = useState([]);
  const [pickerSlot, setPickerSlot] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerProduct, setPickerProduct] = useState(null);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const MAX_QUANTITY = 5;
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageUrl = `${apiUrl.replace('/api', '')}/uploads`;

  const comboItems = useMemo(
    () =>
      product?.isCombo && Array.isArray(product.comboProducts)
        ? product.comboProducts.filter(
            (item) => item && typeof item === 'object' && item._id,
          )
        : [],
    [product],
  );
  const isCombo = comboItems.length > 0;

  const comboPickCount = useMemo(() => {
    if (!isCombo) return 0;
    if (product.variants?.length > 0) {
      return getVariantProductLimit(selectedVariant, comboItems.length);
    }
    return comboItems.length;
  }, [isCombo, product, selectedVariant, comboItems]);

  const comboRequiredCount = Math.min(comboPickCount, comboItems.length);

  // Reset the slots whenever the dialog opens or the combo pack changes.
  useEffect(() => {
    if (!open || !isCombo) {
      setComboPicks([]);
      return;
    }
    setComboPicks(
      product.variants?.length > 0
        ? Array.from({ length: comboRequiredCount }, () => null)
        : comboItems.slice(0, comboRequiredCount).map((item) => ({
            productId: item._id,
            variantId: null,
          })),
    );
    setPickerSlot(null);
    setPickerProduct(null);
  }, [open, isCombo, product, comboRequiredCount, comboItems]);

  const handleOpen = () => {
    setSelectedVariant(null);
    setQuantity(1);
    setComboPicks([]);
    setPickerSlot(null);
    setPickerSearch('');
    setPickerProduct(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPickerSlot(null);
    setPickerProduct(null);
    setPickerSearch('');
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < MAX_QUANTITY) {
      setQuantity((prev) => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Helper to get variant display name from attributes
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
    // Fallback for old structure
    if (variant.size?.name) {
      return variant.size.name;
    }
    return 'N/A';
  };

  // Handle variant selection by its display name
  const handleVariantChange = (displayName) => {
    const newVariant = product.variants.find(
      (variant) => getVariantDisplayName(variant) === displayName,
    );
    setSelectedVariant(newVariant);
  };

  const openPicker = (slotIndex) => {
    setPickerSlot(slotIndex);
    setPickerSearch('');
    setPickerProduct(null);
  };

  const closePicker = () => {
    setPickerSlot(null);
    setPickerSearch('');
    setPickerProduct(null);
  };

  const getPickProduct = (pick) =>
    comboItems.find((item) => String(item._id) === String(pick?.productId));

  const getPickVariant = (pick, slotProduct) =>
    slotProduct?.variants?.find(
      (variant) => String(variant._id) === String(pick?.variantId),
    ) || null;

  const handlePickSelect = (slotProduct, variant = null) => {
    if (pickerSlot === null) return;
    setComboPicks((prev) => {
      const next = [...prev];
      next[pickerSlot] = {
        productId: slotProduct._id,
        variantId: variant?._id || null,
      };
      return next;
    });
    closePicker();
  };

  // Products with variants need an explicit variant choice before they can be
  // added to a combo slot; products without variants are added directly.
  const handlePickProductClick = (slotProduct) => {
    if (slotProduct.variants?.length > 0) {
      setPickerProduct(slotProduct);
      return;
    }
    handlePickSelect(slotProduct, null);
  };

  const handlePickClear = (slotIndex) => {
    setComboPicks((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const handlePickVariantChange = (slotIndex, variantId) => {
    setComboPicks((prev) => {
      const next = [...prev];
      if (next[slotIndex]) {
        next[slotIndex] = { ...next[slotIndex], variantId };
      }
      return next;
    });
  };

  // Combine identical product + variant picks into one cart line.
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

  const comboSelectedCount = comboPicks.filter(Boolean).length;

  const getComboError = () => {
    if (!isCombo || comboPickCount === 0) return '';

    if (comboSelectedCount !== comboRequiredCount) {
      return `Select ${comboRequiredCount} product${comboRequiredCount > 1 ? 's' : ''} for the combo.`;
    }

    const counts = new Map();
    for (let index = 0; index < comboPicks.length; index += 1) {
      const pick = comboPicks[index];
      const slotProduct = getPickProduct(pick);
      if (!slotProduct) return `Choose a product for item ${index + 1}.`;

      const variant = getPickVariant(pick, slotProduct);
      if (slotProduct.variants?.length > 0 && !variant) {
        return `Choose a variant for item ${index + 1}.`;
      }

      const key = `${slotProduct._id}:${variant?._id || 'Default'}`;
      const existing = counts.get(key);
      if (existing) {
        existing.quantity += 1;
      } else {
        counts.set(key, { slotProduct, variant, quantity: 1 });
      }
    }

    for (const { slotProduct, variant, quantity: pickQty } of counts.values()) {
      if (slotProduct.variants?.length > 0) {
        if (!variant || Number(variant.stock || 0) < pickQty) {
          return `${slotProduct.name} (${getVariantLabel(variant)}) is out of stock.`;
        }
      } else if (Number(slotProduct.finalStock || 0) < pickQty) {
        return `${slotProduct.name} is out of stock.`;
      }
    }

    return '';
  };

  const comboError = getComboError();

  const pickerItems = comboItems.filter((item) =>
    String(item.name || '')
      .toLowerCase()
      .includes(pickerSearch.trim().toLowerCase()),
  );

  const handleConfirm = () => {
    if (isCombo && comboError) return;
    addToCart(
      product,
      quantity,
      selectedVariant,
      isCombo ? getComboSelectionsPayload() : null,
    );
    if (isAddToCart) {
      handleClose();
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    if (isNaN(price)) return price;
    return price.toLocaleString();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="primaryBgColor accentTextColor py-2  px-1 text-sm md:text-md  rounded cursor-pointer w-full"
      >
        <div className="flex items-center justify-center gap-4">
          {/*{isAddToCart ? <FaCartArrowDown /> : <FaCreditCard />}*/}
          <span>{isAddToCart ? 'Add to Cart' : 'Buy Now'}</span>
          {product.freeShipping && (
            <span className="border-l border-white/30 pl-3 ml-1">
              Free Delivery
            </span>
          )}
        </div>
      </button>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold mb-4">
            {pickerSlot !== null
              ? pickerProduct
                ? 'Select variant'
                : 'Select product'
              : product.name}
          </DialogTitle>

          {pickerSlot !== null ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-500">
                  {pickerProduct
                    ? pickerProduct.name
                    : `Item ${pickerSlot + 1} of ${comboRequiredCount}`}
                </p>
                <div className="flex items-center gap-1">
                  {pickerProduct && (
                    <button
                      type="button"
                      onClick={() => setPickerProduct(null)}
                      className="rounded-full px-2 py-1 text-xs font-semibold text-[#2E7D31] hover:bg-[#F4FAF4]"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closePicker}
                    className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                    aria-label="Close product picker"
                  >
                    <FaXmark />
                  </button>
                </div>
              </div>

              {pickerProduct ? (
                <div className="grid max-h-[45vh] grid-cols-1 gap-2 overflow-y-auto">
                  {pickerProduct.variants?.map((itemVariant) => {
                    const isVariantOutOfStock =
                      Number(itemVariant.stock || 0) === 0;
                    return (
                      <button
                        key={itemVariant._id}
                        type="button"
                        disabled={isVariantOutOfStock}
                        onClick={() =>
                          handlePickSelect(pickerProduct, itemVariant)
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-medium text-gray-900 transition-colors hover:border-[#2E7D31]/60 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {getVariantLabel(itemVariant)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  {/*<input*/}
                  {/*  type="search"*/}
                  {/*  autoFocus*/}
                  {/*  value={pickerSearch}*/}
                  {/*  onChange={(e) => setPickerSearch(e.target.value)}*/}
                  {/*  placeholder="Search products..."*/}
                  {/*  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2E7D31] focus:outline-none"*/}
                  {/*/>*/}

                  <div className="grid max-h-[75vh] grid-cols-2 gap-2 overflow-y-auto">
                    {pickerItems.map((item) => {
                      const isOutOfStock =
                        item.variants?.length > 0
                          ? !item.variants.some(
                              (itemVariant) =>
                                Number(itemVariant.stock || 0) > 0,
                            )
                          : Number(item.finalStock || 0) === 0;

                      return (
                        <button
                          key={item._id}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handlePickProductClick(item)}
                          className="group overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-colors hover:border-[#2E7D31]/60 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className=" w-full overflow-hidden bg-gray-50">
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

                    {pickerItems.length === 0 && (
                      <p className="col-span-full py-4 text-center text-sm text-gray-500">
                        No products found.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Variant Price */}
              {selectedVariant && (
                <div className="flex gap-2">
                  {selectedVariant.discount > 0 ? (
                    <>
                      <div className="line-through">
                        Tk. {formatPrice(Number(selectedVariant.price))}
                      </div>
                      <div className="text-red-800">
                        Tk. {formatPrice(Number(selectedVariant.discount))}
                      </div>
                    </>
                  ) : (
                    <div className="text-black">
                      Tk. {formatPrice(Number(selectedVariant.price))}
                    </div>
                  )}
                </div>
              )}

              {/* Non-variant Price */}
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
                    </>
                  ) : (
                    <div className="text-black font-medium">
                      Tk. {formatPrice(Number(product.finalPrice))}
                    </div>
                  )}
                </div>
              )}

              {/* Attribute Variants */}
              {product.variants?.length > 0 && (
                <div className="flex gap-4 items-center mt-4">
                  <h2 className="text-lg">Options:</h2>
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map((variant) => {
                      const variantDisplayName = getVariantDisplayName(variant);
                      const isSelected =
                        getVariantDisplayName(selectedVariant) ===
                        variantDisplayName;
                      return (
                        <button
                          key={variant._id}
                          onClick={() =>
                            handleVariantChange(variantDisplayName)
                          }
                          className={`px-2 py-1 rounded transition-all cursor-pointer ${
                            isSelected
                              ? 'primaryBgColor text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {variantDisplayName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.variants?.length > 0 && !selectedVariant && (
                <p className="text-red-500 text-sm mt-2">
                  Please select an option
                </p>
              )}

              {/* Combo product selection */}
              {isCombo && (
                <div className="mt-4 space-y-2 rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold">
                      Build your combo
                    </h2>
                    {comboPickCount > 0 && (
                      <span className="rounded-full bg-[#F4FAF4] px-2 py-0.5 text-xs font-semibold text-[#2E7D31]">
                        {comboSelectedCount} / {comboRequiredCount}
                      </span>
                    )}
                  </div>

                  {comboPickCount === 0 ? (
                    <p className="text-sm text-gray-500">
                      Select an option above to choose your products.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {Array.from({ length: comboRequiredCount }).map(
                        (_, slotIndex) => {
                          const pick = comboPicks[slotIndex];
                          const slotProduct = pick
                            ? getPickProduct(pick)
                            : null;

                          if (!slotProduct) {
                            return (
                              <button
                                key={slotIndex}
                                type="button"
                                onClick={() => openPicker(slotIndex)}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-2 py-3 text-xs font-semibold text-gray-700 transition-colors hover:border-[#2E7D31]/50 hover:bg-[#F4FAF4]"
                              >
                                <FaPlus className="text-[10px] text-[#2E7D31]" />
                                Select product · Item {slotIndex + 1}
                              </button>
                            );
                          }

                          return (
                            <div
                              key={slotIndex}
                              className="rounded-lg border border-[#2E7D31]/40 bg-white p-2"
                            >
                              <div className="flex items-start gap-2">
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-gray-50">
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
                                  onClick={() => handlePickClear(slotIndex)}
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
                                    handlePickVariantChange(
                                      slotIndex,
                                      e.target.value,
                                    )
                                  }
                                  className="mt-2 w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[#2E7D31] focus:outline-none"
                                >
                                  <option value="" disabled>
                                    Select variant
                                  </option>
                                  {slotProduct.variants.map((itemVariant) => (
                                    <option
                                      key={itemVariant._id}
                                      value={itemVariant._id}
                                      disabled={
                                        Number(itemVariant.stock || 0) === 0
                                      }
                                    >
                                      {getVariantLabel(itemVariant)}
                                    </option>
                                  ))}
                                </select>
                              )}

                              <button
                                type="button"
                                onClick={() => openPicker(slotIndex)}
                                className="mt-1.5 text-[11px] font-semibold text-[#2E7D31] hover:underline"
                              >
                                Change product
                              </button>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}

                  {comboError && (
                    <p className="text-sm text-red-500">{comboError}</p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div className="flex gap-4 items-center mt-4">
                <h2 className="text-lg">Quantity</h2>
                <div className="rounded flex items-center justify-between">
                  <button
                    className="primaryBgColor accentTextColor px-2 py-2 rounded-l cursor-pointer"
                    onClick={() => handleQuantityChange('decrease')}
                  >
                    <FiMinus />
                  </button>
                  <span className="px-3 py-1 bg-gray-200">{quantity}</span>
                  <button
                    className="primaryBgColor accentTextColor px-2 py-2 rounded-r cursor-pointer"
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= MAX_QUANTITY}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              {/* Stock Info */}
              <div className="mt-4">
                {selectedVariant?.stock === 0 || product.finalStock === 0 ? (
                  <span className="text-red-600 font-semibold">Stock Out</span>
                ) : selectedVariant?.stock < 20 || product.finalStock < 20 ? (
                  <span className="primaryTextColor font-semibold">
                    Only {selectedVariant?.stock || product.finalStock} left!
                  </span>
                ) : null}
              </div>
              <DialogActions className="mt-4">
                <Button onClick={handleClose} variant="outline">
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={
                    (product.variants?.length > 0 && !selectedVariant) ||
                    selectedVariant?.stock === 0 ||
                    product.finalStock === 0 ||
                    Boolean(comboError)
                  }
                  className="primaryBgColor"
                >
                  {isAddToCart ? 'Add to Cart' : 'Proceed to Checkout'}
                </Button>
              </DialogActions>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BuyNowButton;
