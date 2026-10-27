import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
  Suspense,
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import useProductStore from '../../store/useProductStore.js';
import GeneralInfoStore from '../../store/GeneralInfoStore.js';
import useCartStore from '../../store/useCartStore.js';
import Skeleton from 'react-loading-skeleton';
import LazySocialShareButtons from './LazySocialShareButtons.jsx';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@/components/ui/accordion';
import { ChevronDown as ExpandMoreIcon, Truck } from 'lucide-react';
import ProductGallery from './ProductGallery.jsx';
import ProductAddToCart from './ProductAddToCart.jsx';
import ProductBreadcrumbs from './ProductBreadcrumbs.jsx';
import ProductDetailsSkeleton from '../skeleton/ProductDetailsSkeleton.jsx';
import sanitizeHtml from '../../utils/sanitizeHtml.js';
const SimilarProducts = lazy(() => import('./SimilarProducts.jsx'));
const YouTubeEmbed = lazy(() => import('./YouTubeEmbed.jsx'));
const RecentlyViewedProducts = lazy(
  () => import('./RecentlyViewedProducts.jsx'),
);

const ProductDetails = () => {
  const hasPushedRef = useRef(false);

  const { fetchProductBySlug, product, loading, error, resetProduct } =
    useProductStore();

  const { GeneralInfoList } = GeneralInfoStore();
  const { cart } = useCartStore();
  const { slug } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [currentProductSlug, setCurrentProductSlug] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [freeDeliveryAmount, setFreeDeliveryAmount] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (slug !== currentProductSlug) {
      // Reset product state and show loading
      resetProduct(); // Clear previous product data
      setCurrentProductSlug(slug);
      fetchProductBySlug(slug);
    }
  }, [slug, currentProductSlug, fetchProductBySlug, resetProduct]);

  useEffect(() => {
    const fetchAmount = async () => {
      try {
        const res = await axios.get(`${apiUrl}/getFreeDeliveryAmount`);
        if (res.data?.success) {
          setFreeDeliveryAmount(res.data?.data?.value);
        }
      } catch (err) {
        console.error('Failed to fetch free delivery amount:', err.message);
      }
    };

    fetchAmount();
  }, [apiUrl]);

  const cartTotal = cart.reduce((total, item) => {
    const price =
      item.discountPrice > 0 ? item.discountPrice : item.originalPrice;
    return total + price * item.quantity;
  }, 0);

  const formatAmount = (value) => Number(value).toLocaleString();

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

  const location = useLocation();
  const url = `${window.location.origin}${location.pathname}`;
  const title = product?.name;

  // Gallery order: every variant image first (in variant order), then the
  // product images. Duplicated names are shown only once, and a variant image
  // that is also part of the product images is not repeated.
  const displayImages = useMemo(() => {
    const base = product?.images || [];
    const variantImageNames = new Set();
    (product?.variants || []).forEach((v) => {
      if (v?.image && !variantImageNames.has(v.image)) {
        variantImageNames.add(v.image);
      }
    });
    const variantImages = Array.from(variantImageNames);
    const rest = base.filter((img) => !variantImages.includes(img));
    return [...variantImages, ...rest];
  }, [product]);

  // Selecting a variant moves the gallery focus to that variant's image; only
  // variants of the CURRENT product count, so a stale selection from a
  // previously viewed product is ignored.
  const focusedVariantImage = useMemo(() => {
    const belongsToProduct = product?.variants?.some(
      (v) => v?._id && v._id === selectedVariant?._id,
    );
    return belongsToProduct ? selectedVariant?.image : undefined;
  }, [product, selectedVariant]);

  const discountPercentage =
    product?.finalPrice && product?.finalDiscount
      ? calculateDiscountPercentage(product.finalPrice, product.finalDiscount)
      : 0;

  const cleanHtml = (html) => sanitizeHtml(html);

  // Data layer for View Content

  useEffect(() => {
    if (!product || hasPushedRef.current) return;

    const price =
      (product?.finalDiscount ?? 0) > 0
        ? (product?.finalDiscount ?? 0)
        : (product?.finalPrice ?? 0);

    const discount =
      (product?.finalDiscount ?? 0) > 0
        ? (product?.finalPrice ?? 0) - (product?.finalDiscount ?? 0)
        : 0;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: price,
        items: [
          {
            item_id: product.productId,
            item_name: product.name,
            currency: 'BDT',
            discount,
            item_variant: 'Default',
            price,
            quantity: 1,
          },
        ],
      },
    });

    hasPushedRef.current = true;
  }, [product]);

  useEffect(() => {
    if (!product?._id) return;

    // Get existing list or empty array
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

    // Remove if already exists (avoid duplicates)
    viewed = viewed.filter((item) => item._id !== product._id);

    // Add new one at beginning
    viewed.unshift({
      _id: product._id,
      name: product.name,
      isActive: product.isActive,
      category: product.category,
      finalDiscount: product.finalDiscount,
      finalPrice: product.finalPrice,
      productId: product.productId,
      slug: product.slug,
      variants: product.variants,
      finalStock: product.finalStock,
      flags: product.flags,
      images: product.images,
      thumbnailImage: product.thumbnailImage,
    });

    // Limit to 5 items
    viewed = viewed.slice(0, 5);

    // Save back
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    setRecentlyViewed(viewed);
  }, [product]);

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="xl:container xl:mx-auto p-3">
        <div className="flex flex-col items-center justify-center pt-40 text-gray-500">
          <h1 className="text-2xl font-semibold mb-2">Product Not Found</h1>
          <p>
            The product you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (product.slug !== slug) {
    return <ProductDetailsSkeleton />;
  }

  return (
    <div className="xl:container xl:mx-auto p-3">
      {error && (
        <div className="text-red-500 flex items-center justify-center pt-40">
          Error: {error}
        </div>
      )}

      {product && (
        <div>
          {/*Seo Meta Data*/}
          <title>{`${product?.name || product?.metaTitle} | ${GeneralInfoList?.CompanyName}`}</title>
          <meta name="description" content={product?.metaDescription} />
          <meta
            name="keywords"
            content={product?.metaKeywords?.join(', ') ?? ''}
          />
          <meta
            property="og:title"
            content={`${product?.name || product?.metaTitle} | ${GeneralInfoList?.CompanyName}`}
          />
          <meta property="og:description" content={product?.metaDescription} />
          <meta property="og:image" content={product?.thumbnailImage} />
          <meta property="og:url" content={window.location.href} />
          <link
            rel="canonical"
            href={`https://ecommerce.digiwebdigital.com/product/${slug}`}
          />

          {/*BreadCrumbs*/}
          <ProductBreadcrumbs product={product} />

          <div className="md:grid md:grid-cols-8 lg:grid-cols-9 xl:grid-cols-9 gap-8">
            <div className="md:col-span-4 lg:col-span-6 xl:col-span-5 relative">
              <ProductGallery
                images={displayImages}
                focusImageName={focusedVariantImage}
                discount={discountPercentage}
                productName={product.name}
              />
            </div>
            <div className="flex flex-col gap-3 md:col-span-4 lg:col-span-3 xl:col-span-4 pt-4 md:pt-0">
              <ProductAddToCart
                product={product}
                onVariantChange={setSelectedVariant}
              />

              {/*Free Delivery Tracker*/}
              {freeDeliveryAmount > 1 && (
                <div className="rounded-2xl border border-[#2E7D31]/15 bg-[#F4FAF4] p-4">
                  {cartTotal >= freeDeliveryAmount ? (
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#2E7D31]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2E7D31] text-white">
                        <Truck className="size-4" aria-hidden="true" />
                      </span>
                      Free delivery unlocked — shipping is on us
                    </p>
                  ) : (
                    <>
                      <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2E7D31]/10 text-[#2E7D31]">
                          <Truck className="size-4" aria-hidden="true" />
                        </span>
                        Add{' '}
                        <span className="font-bold text-gray-900">
                          Tk. {formatAmount(freeDeliveryAmount - cartTotal)}
                        </span>{' '}
                        more to get free delivery
                      </p>
                      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#2E7D31]/10">
                        <div
                          className="h-full rounded-full bg-[#2E7D31] transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (cartTotal / freeDeliveryAmount) * 100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Subtotal: Tk. {formatAmount(cartTotal)} of Tk.{' '}
                        {formatAmount(freeDeliveryAmount)}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/*Social Share Buttons*/}
              <div className="flex items-center gap-2">
                <h1>Social Share:</h1>
                <LazySocialShareButtons url={url} title={title} />
              </div>

              {/*Short Description*/}
              {product.shortDesc && (
                <div
                  className="rendered-html"
                  dangerouslySetInnerHTML={{
                    __html: cleanHtml(product.shortDesc),
                  }}
                />
              )}
            </div>
          </div>

          {/*YoutubeEmbed*/}
          {product.videoUrl && (
            <div className={'flex items-center justify-center pt-10 pb-10'}>
              <Suspense
                fallback={
                  <div className="w-full sm:w-[560px]">
                    <div className="aspect-video">
                      <Skeleton className="w-full h-full" />
                    </div>
                  </div>
                }
              >
                <YouTubeEmbed videoId={product.videoUrl} />
              </Suspense>
            </div>
          )}

          <div className={'xl:w-3/4 mx-auto  mt-4 flex flex-col gap-4'}>
            {/*product Description*/}
            {product.longDesc && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Description
                </AccordionSummary>
                <AccordionDetails style={{ minHeight: '20rem' }}>
                  <div
                    className="rendered-html"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(product.longDesc),
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )}
            {/*Product Size Chart*/}
            {product.sizeChart && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Size Chart
                </AccordionSummary>
                <AccordionDetails style={{ minHeight: '20rem' }}>
                  <div
                    className="rendered-html"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(product.sizeChart),
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )}

            {/*Shipping and Return*/}
            {product.shippingReturn && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Shipping and Return
                </AccordionSummary>
                <AccordionDetails style={{ minHeight: '20rem' }}>
                  <div
                    className="rendered-html"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(product.shippingReturn),
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </div>
          <div>
            <Suspense fallback={<Skeleton height={200} width={'100%'} />}>
              <RecentlyViewedProducts
                currentProductId={product._id}
                products={recentlyViewed}
              />
            </Suspense>
            <Suspense fallback={<Skeleton height={200} width={'100%'} />}>
              <SimilarProducts
                categoryId={product?.category?._id}
                productId={product?._id}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
