import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Typography } from '@/components/ui/typography';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import ProductGallery from './ProductGallery.jsx';
import ProductAddToCart from './ProductAddToCart.jsx';
import BuyNowButton from './BuyNowButton.jsx';
import ImageComponent from './ImageComponent.jsx';
import WishlistButton from './WishlistButton.jsx';

// Memoize the formatted price function
const formatPrice = (price) => {
  if (isNaN(price)) return price;
  return price.toLocaleString();
};

const ProductList = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleOpen = (product) => {
    setSelectedProduct(product);
  };

  const handleClose = () => {
    setSelectedProduct(null);
  };
  const calculateDiscountPercentage = (
    priceBeforeDiscount,
    priceAfterDiscount,
  ) => {
    if (
      !priceBeforeDiscount ||
      !priceAfterDiscount ||
      priceBeforeDiscount <= priceAfterDiscount
    )
      return 0;
    const discountAmount = priceBeforeDiscount - priceAfterDiscount;
    return Math.ceil((discountAmount / priceBeforeDiscount) * 100);
  };
  return (
    <div>
      {products.filter((product) => product.isActive).length === 0 ? (
        <Typography
          variant="body1"
          className="text-center text-gray-500 p-20 md:p-70 shadow rounded-lg"
        >
          No products found. Please check back later!
        </Typography>
      ) : (
        <div
          className={
            'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4'
          }
        >
          {/*Product Display Section*/}
          {products.map((product) => (
            <div key={product.slug} className="relative min-h-[250px]">
              <Link to={`/product/${product.slug}`} className="block">
                <ImageComponent
                  imageName={product.thumbnailImage}
                  className="w-full aspect-square object-cover"
                  altName={product.name}
                  skeletonHeight={250}
                />
                <div className="text-center mt-1 mb-1 hover:underline truncate">
                  {product.name}
                </div>
              </Link>

              <div className="flex gap-2 justify-center">
                {/*Base Price*/}
                {product.variants?.length ? (
                  product.variants[0].discount > 0 ? (
                    <div className="line-through">
                      Tk. {formatPrice(Number(product.variants[0].price))}
                    </div>
                  ) : (
                    <div>
                      Tk. {formatPrice(Number(product.variants[0].price))}
                    </div>
                  )
                ) : product.finalDiscount > 0 ? (
                  <div className="line-through">
                    Tk. {formatPrice(Number(product.finalPrice))}
                  </div>
                ) : (
                  <div>Tk. {formatPrice(Number(product.finalPrice))}</div>
                )}

                {/*Discount Price*/}
                {product.variants?.length
                  ? product.variants[0].discount > 0 && (
                      <div className="text-red-800">
                        Tk. {formatPrice(Number(product.variants[0].discount))}
                      </div>
                    )
                  : product.finalDiscount > 0 && (
                      <div className="text-red-800">
                        Tk. {formatPrice(Number(product.finalDiscount))}
                      </div>
                    )}
              </div>

              {/* Discount Percentage */}
              <div className="absolute top-2 left-0 z-10 ">
                {product.variants?.length > 0
                  ? product.variants[0].discount > 0 && (
                      <span className="bg-red-400 px-2 py-1 rounded text-white">
                        -
                        {calculateDiscountPercentage(
                          product.variants[0].price,
                          product.variants[0].discount,
                        )}
                        %
                      </span>
                    )
                  : product.finalDiscount > 0 && (
                      <span className="bg-red-400 px-2 py-1 text-white rounded">
                        -
                        {calculateDiscountPercentage(
                          product.finalPrice,
                          product.finalDiscount,
                        )}
                        %
                      </span>
                    )}
              </div>

              {/* Quick View Button */}
              <div className="absolute top-1 right-0 z-10 flex gap-1 bg-white rounded-full justify-center items-center">
                <WishlistButton
                  product={product}
                  size={18}
                  className="!p-1.5"
                />
                <button
                  onClick={() => handleOpen(product)}
                  className="p-2 cursor-pointer"
                  aria-label={`Quick view ${product.name}`}
                >
                  <FaEye aria-hidden="true" />
                </button>
              </div>
              <div className={'pt-5'}>
                <BuyNowButton product={product} isAddToCart={false} />
              </div>
            </div>
          ))}

          {/* Quick View Modal */}
          {selectedProduct && (
            <Dialog
              open={Boolean(selectedProduct)}
              onOpenChange={(open) => !open && handleClose()}
            >
              <DialogContent className="sm:max-w-4xl w-[calc(100%-1.5rem)] p-3 sm:p-6 max-h-[95vh] overflow-y-auto scrollbar-hide">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-2 sm:gap-4">
                  <ProductGallery
                    images={selectedProduct.images}
                    discount={calculateDiscountPercentage(
                      selectedProduct.finalPrice,
                      selectedProduct.finalDiscount,
                    )}
                    zoom={false}
                  />
                  <div>
                    <ProductAddToCart
                      product={selectedProduct}
                      onAddToCart={handleClose}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
