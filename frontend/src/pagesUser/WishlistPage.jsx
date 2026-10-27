import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../store/useWishlistStore.js';
import useAuthUserStore from '../store/AuthUserStore.js';
import WishlistButton from '../component/componentGeneral/WishlistButton.jsx';
import ImageComponent from '../component/componentGeneral/ImageComponent.jsx';
import BuyNowButton from '../component/componentGeneral/BuyNowButton.jsx';
import { Heart } from 'lucide-react';

const formatPrice = (price) => {
  if (isNaN(price)) return price;
  return price.toLocaleString();
};

const calculateDiscountPercentage = (
  priceBeforeDiscount,
  priceAfterDiscount,
) => {
  if (
    !priceBeforeDiscount ||
    !priceAfterDiscount ||
    priceBeforeDiscount <= priceAfterDiscount
  ) {
    return 0;
  }
  const discountAmount = priceBeforeDiscount - priceAfterDiscount;
  return Math.ceil((discountAmount / priceBeforeDiscount) * 100);
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
 
  :root {
    --cream: #faf8f5;
    --warm-white: #fffef9;
    --charcoal: #1a1a1a;
    --warm-gray: #6b6560;
    --blush: #e8c4b8;
    --rose: #c4614a;
    --rose-light: #f5e6e1;
    --gold: #c9a96e;
    --border: #e8e3dc;
    --shadow: 0 4px 24px rgba(26,26,26,0.08);
    --shadow-hover: 0 12px 40px rgba(26,26,26,0.16);
    --radius: 2px;
  }
 
  .wishlist-page {
    min-height: 100vh;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--charcoal);
  }
 
  .wishlist-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }
 
  /* Header */
  .wishlist-header {
    text-align: center;
    margin-bottom: 56px;
    position: relative;
  }
 
  .wishlist-header::after {
    content: '';
    display: block;
    width: 48px;
    height: 1px;
    background: var(--gold);
    margin: 20px auto 0;
  }
 
  .wishlist-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--warm-gray);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
 
  .wishlist-eyebrow span {
    display: inline-block;
    width: 20px;
    height: 1px;
    background: var(--warm-gray);
  }
 
  .wishlist-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 400;
    color: var(--charcoal);
    letter-spacing: -0.5px;
    line-height: 1.1;
  }
 
  .wishlist-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--rose-light);
    color: var(--rose);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1px;
    padding: 4px 12px;
    border-radius: 20px;
    margin-top: 14px;
  }
 
`;

const WishlistPage = () => {
  const { user } = useAuthUserStore();
  const { wishlist, getWishlist, removeFromWishlist, loading, removing } =
    useWishlistStore();

  useEffect(() => {
    if (user) {
      getWishlist();
    }
  }, [user]);

  const displayWishlist = wishlist.filter(
    (item) =>
      item.product &&
      (item.product.finalPrice || item.product.finalPrice === 0),
  );

  const showLoading = loading && wishlist.length === 0;
  const isEmpty = displayWishlist.length === 0;

  return (
    <>
      <style>{styles}</style>
      <div className="p-4">
        <div className="wishlist-header">
          <div className="wishlist-eyebrow">
            <span />
            Curated by you
            <span />
          </div>
          <h1 className="wishlist-title">My Wishlist</h1>
          {!showLoading && !isEmpty && (
            <div className="wishlist-count">
              <Heart size={11} className={'text-red-500'} />
              {displayWishlist.length}{' '}
              {displayWishlist.length === 1 ? 'item' : 'items'} saved
            </div>
          )}
        </div>

        {showLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : isEmpty && !removing ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600 mb-4">Your wishlist is empty</p>
            <Link to="/shop" className="text-blue-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3  gap-3 mt-4">
            {displayWishlist.map((item) => {
              const product = item.product;
              if (!product || !product.finalPrice) return null;

              return (
                <div key={item._id} className="relative min-h-[250px]">
                  <Link to={`/product/${product.slug}`}>
                    <ImageComponent
                      imageName={product.thumbnailImage}
                      className="w-full aspect-square object-cover"
                      altName={product.name}
                      skeletonHeight={250}
                    />
                  </Link>
                  <Link to={`/product/${product.slug}`}>
                    <div className="text-center mt-2 mb-1 hover:underline truncate">
                      {product.name}
                    </div>
                  </Link>

                  <div className="flex gap-2 justify-center">
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

                    {product.variants?.length
                      ? product.variants[0].discount > 0 && (
                          <div className="text-red-800">
                            Tk.{' '}
                            {formatPrice(Number(product.variants[0].discount))}
                          </div>
                        )
                      : product.finalDiscount > 0 && (
                          <div className="text-red-800">
                            Tk. {formatPrice(Number(product.finalDiscount))}
                          </div>
                        )}
                  </div>

                  <div className="absolute top-1 z-10">
                    {product.variants?.length > 0
                      ? product.variants[0].discount > 0 && (
                          <span className="bg-red-400 px-2 py-1 text-white">
                            -
                            {calculateDiscountPercentage(
                              product.variants[0].price,
                              product.variants[0].discount,
                            )}
                            %
                          </span>
                        )
                      : product.finalDiscount > 0 && (
                          <span className="bg-red-400 px-2 py-1 text-white">
                            -
                            {calculateDiscountPercentage(
                              product.finalPrice,
                              product.finalDiscount,
                            )}
                            %
                          </span>
                        )}
                  </div>

                  <div
                    className={'py-3 flex gap-2 justify-center items-center'}
                  >
                    <BuyNowButton product={product} />
                  </div>

                  <div className="absolute top-1 right-1 z-10">
                    <WishlistButton
                      product={product}
                      size={18}
                      className="!p-1.5 shadow-md"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
