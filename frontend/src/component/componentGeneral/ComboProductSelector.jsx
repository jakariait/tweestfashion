import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { FaPlus, FaXmark } from 'react-icons/fa6';

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

const ComboProductSelector = forwardRef(function ComboProductSelector(
  { product, selectedVariant = null, onChange, className = '' },
  ref,
) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageUrl = `${apiUrl.replace('/api', '')}/uploads`;

  const [comboPicks, setComboPicks] = useState([]);
  const [comboValidation, setComboValidation] = useState('');
  const [pickerSlot, setPickerSlot] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerProduct, setPickerProduct] = useState(null);

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

  // Reset the slots whenever the combo pack or its bundle selection changes.
  useEffect(() => {
    if (!isCombo || comboPickCount === 0) {
      setComboPicks([]);
      setPickerSlot(null);
      setPickerProduct(null);
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
    setComboValidation('');
  }, [
    isCombo,
    product,
    selectedVariant,
    comboPickCount,
    comboRequiredCount,
    comboItems,
  ]);

  const openPicker = (slotIndex) => {
    setPickerSlot(slotIndex);
    setPickerSearch('');
    setPickerProduct(null);
    setComboValidation('');
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
    setComboValidation('');
    closePicker();
  };

  // Products with variants require an explicit variant choice before they are
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
    setComboValidation('');
  };

  const handlePickVariantChange = (slotIndex, variantId) => {
    setComboPicks((prev) => {
      const next = [...prev];
      if (next[slotIndex]) {
        next[slotIndex] = { ...next[slotIndex], variantId };
      }
      return next;
    });
    setComboValidation('');
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
  const comboSelectionComplete =
    comboRequiredCount > 0 && comboSelectedCount === comboRequiredCount;

  const validateComboSelection = () => {
    if (!isCombo) return true;

    if (product.variants?.length > 0 && !selectedVariant) {
      setComboValidation('Select a combo pack option first.');
      return false;
    }

    if (comboPickCount === 0 || !comboPicks.some(Boolean)) {
      setComboValidation('Select the products for this combo.');
      return false;
    }

    if (comboSelectedCount !== comboRequiredCount) {
      setComboValidation(
        `Select ${comboRequiredCount} product${comboRequiredCount > 1 ? 's' : ''} (${comboSelectedCount} selected).`,
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

    for (const { slotProduct, variant, quantity: pickQty } of counts.values()) {
      if (slotProduct.variants?.length > 0) {
        if (!variant || Number(variant.stock || 0) < pickQty) {
          setComboValidation(
            Number(variant?.stock || 0) > 0
              ? `Only ${variant.stock} left of ${slotProduct.name} (${getVariantLabel(variant)}).`
              : `${slotProduct.name} (${getVariantLabel(variant)}) is out of stock.`,
          );
          return false;
        }
      } else if (Number(slotProduct.finalStock || 0) < pickQty) {
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
    if (!isCombo || !comboPicks.some(Boolean)) return null;

    const entries = getComboSelectionsPayload();
    if (entries.length === 0) return null;

    const availablePerEntry = entries.map((entry) => {
      const comboProduct = getPickProduct(entry);
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

  const comboStockOut =
    isCombo &&
    comboSelectionComplete &&
    Number.isFinite(comboAvailableStock) &&
    comboAvailableStock === 0;

  const pickerItems = comboItems.filter((item) =>
    String(item.name || '')
      .toLowerCase()
      .includes(pickerSearch.trim().toLowerCase()),
  );

  useImperativeHandle(ref, () => ({
    validate: validateComboSelection,
    getPayload: getComboSelectionsPayload,
  }));

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onChangeRef.current?.({
      availableStock: comboAvailableStock,
      stockOut: comboStockOut,
      isComplete: comboSelectionComplete,
      selectedCount: comboSelectedCount,
      requiredCount: comboRequiredCount,
    });
  }, [
    comboAvailableStock,
    comboStockOut,
    comboSelectionComplete,
    comboSelectedCount,
    comboRequiredCount,
  ]);

  if (!isCombo) return null;

  return (
    <>
      <div
        className={`space-y-3 rounded-xl border border-gray-200 p-3 ${className}`}
      >
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

            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: comboRequiredCount }).map(
                (_, slotIndex) => {
                  const pick = comboPicks[slotIndex];
                  const slotProduct = pick ? getPickProduct(pick) : null;

                  if (!slotProduct) {
                    return (
                      <button
                        key={slotIndex}
                        type="button"
                        onClick={() => openPicker(slotIndex)}
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
                          onClick={() => handlePickClear(slotIndex)}
                          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                          aria-label={`Remove item ${slotIndex + 1}`}
                        >
                          <FaXmark className="text-xs" />
                        </button>
                      </div>

                      {slotProduct.variants?.length > 0 && (
                        <div className="mt-2">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            Variant
                          </label>
                          <select
                            value={pick.variantId || ''}
                            onChange={(e) =>
                              handlePickVariantChange(slotIndex, e.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-900 focus:border-[#2E7D31] focus:outline-none"
                          >
                            <option value="">Select variant</option>
                            {slotProduct.variants.map((itemVariant) => (
                              <option
                                key={itemVariant._id}
                                value={itemVariant._id}
                                disabled={Number(itemVariant.stock || 0) === 0}
                              >
                                {getVariantLabel(itemVariant)}
                                {Number(itemVariant.stock || 0) === 0
                                  ? ' (out of stock)'
                                  : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openPicker(slotIndex)}
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

      <Dialog
        open={pickerSlot !== null}
        onOpenChange={(o) => !o && closePicker()}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden p-0">
          <DialogTitle className="sr-only">
            {pickerProduct ? 'Select variant' : 'Select product'}
          </DialogTitle>
          <div className="flex max-h-[85vh] flex-col overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">
                  {pickerProduct ? 'Select variant' : 'Select product'}
                </h3>
                <p className="truncate text-xs text-gray-500">
                  {pickerProduct
                    ? pickerProduct.name
                    : `Item ${pickerSlot + 1} of ${comboRequiredCount}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {pickerProduct && (
                  <button
                    type="button"
                    onClick={() => setPickerProduct(null)}
                    className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-[#2E7D31] transition-colors hover:bg-[#F4FAF4]"
                  >
                    Back
                  </button>
                )}
              </div>
            </div>

            {pickerProduct ? (
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <p className="mb-2 text-xs text-gray-500">
                  Choose a variant to add this product to your combo.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              </div>
            ) : (
              <div className="grid flex-1 auto-rows-max grid-cols-2 gap-2 overflow-y-auto px-4 py-3 sm:grid-cols-3">
                {pickerItems.map((item) => {
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
                      onClick={() => handlePickProductClick(item)}
                      className="group flex h-full flex-col rounded-lg border border-gray-200 bg-white text-left transition-colors hover:border-[#2E7D31]/60 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="h-50 w-full shrink-0 overflow-hidden rounded-t-lg bg-gray-50">
                        {item.thumbnailImage ? (
                          <img
                            src={`${imageUrl}/${item.thumbnailImage}`}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-2">
                        <p className="line-clamp-2 break-words text-xs font-medium leading-snug text-gray-900">
                          {item.name}
                        </p>
                        {isOutOfStock ? (
                          <p className="mt-auto text-[10px] font-semibold uppercase text-red-500">
                            Out of stock
                          </p>
                        ) : item.variants?.length > 0 ? (
                          <p className="mt-auto text-[10px] font-semibold uppercase text-[#2E7D31]">
                            Select variant
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {pickerItems.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm text-gray-500">
                    No products found.
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default ComboProductSelector;
