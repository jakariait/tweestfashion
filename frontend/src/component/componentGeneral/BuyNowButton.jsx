import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DialogActions } from '@/components/ui/dialog-actions';
import { FaPlus } from 'react-icons/fa6';
import { FiMinus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore.js';

const BuyNowButton = ({ product, isAddToCart = false }) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const MAX_QUANTITY = 5;

  const handleOpen = () => {
    setSelectedVariant(null);
    setQuantity(1);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

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

  const handleConfirm = () => {
    addToCart(product, quantity, selectedVariant);
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
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="text-lg font-semibold mb-4">
            {product.name}
          </DialogTitle>
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
                      onClick={() => handleVariantChange(variantDisplayName)}
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
            <p className="text-red-500 text-sm mt-2">Please select an option</p>
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
                product.finalStock === 0
              }
              className="primaryBgColor"
            >
              {isAddToCart ? 'Add to Cart' : 'Proceed to Checkout'}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BuyNowButton;
