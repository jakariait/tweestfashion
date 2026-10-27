import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus,
  Minus,
} from 'lucide-react';
import ImageComponent from './ImageComponent.jsx';

const apiUrl = import.meta.env.VITE_API_URL;

const MOBILE_VISIBLE = 6;

const arrowBtn =
  'absolute top-1/2 -translate-y-1/2 z-20 size-10 md:size-11 flex items-center justify-center rounded-full bg-white text-[var(--primaryColor)] border border-gray-200 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.25)] transition-all duration-200 hover:primaryBgColor hover:text-white hover:border-transparent hover:shadow-lg active:scale-95 disabled:opacity-0 disabled:pointer-events-none';

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, subRes, childRes] = await Promise.allSettled([
          axios.get(`${apiUrl}/category`),
          axios.get(`${apiUrl}/sub-category`),
          axios.get(`${apiUrl}/child-category`),
        ]);
        const allCats =
          catRes.status === 'fulfilled' ? catRes.value.data.categories || [] : [];
        const allSubs =
          subRes.status === 'fulfilled' ? subRes.value.data.subCategories || [] : [];
        const allChildren =
          childRes.status === 'fulfilled'
            ? childRes.value.data.childCategories || []
            : [];
        setCategories(allCats.filter((c) => c.showOnHomePage));
        setSubCategories(allSubs.filter((s) => s.showOnHomePage));
        setChildCategories(allChildren.filter((c) => c.showOnHomePage));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allItems = [
    ...categories.map((c) => ({
      ...c,
      link: `/shop?category=${c.name}`,
    })),
    ...subCategories.map((s) => ({
      ...s,
      link: `/shop?subcategory=${s.slug}`,
    })),
    ...childCategories.map((c) => ({
      ...c,
      link: `/shop?childCategory=${c.slug}`,
    })),
  ];

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, loading, allItems.length]);

  const scrollByAmount = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (!loading && allItems.length === 0) return null;

  const visibleItems = showMore ? allItems : allItems.slice(0, MOBILE_VISIBLE);
  const hasMore = allItems.length > MOBILE_VISIBLE;

  const cardClass =
    'group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_18px_35px_-15px_rgba(0,57,93,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primaryColor)]/40';

  const renderItem = (item, i) => (
    <Link
      key={`${item._id || i}`}
      to={item.link}
      className={cardClass}
      aria-label={item.name}
    >
      <span className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 ring-1 ring-inset ring-[var(--primaryColor)]/25 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative w-full overflow-hidden">
        <div className=" w-full">
          <ImageComponent
            imageName={item.image}
            className="h-full w-full object-contain px-4 transition-transform duration-500 ease-out group-hover:scale-110"
            altName={item.name}
            skeletonHeight={130}
          />
        </div>
      </div>

      {/* name sits flush under the image — no separator, no own background */}
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-center">
        <h3 className="line-clamp-2 font-medium leading-snug text-gray-800 transition-colors duration-300 group-hover:primaryTextColor">
          {item.name}
        </h3>
        <span className="text-xs font-medium text-gray-500 transition-colors duration-300 group-hover:text-[var(--primaryColor)]">
          {item.productsCount || 0}{' '}
          {item.productsCount === 1 ? 'item' : 'items'}
        </span>
      </div>
    </Link>
  );

  const shopAllCard = (
    <Link
      to="/shop"
      className={cardClass}
    >
      <span className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 ring-1 ring-inset ring-[var(--primaryColor)]/25 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative w-full overflow-hidden">
        <div className="h-full w-full flex items-center justify-center p-4 bg-gradient-to-br from-[var(--primaryColor)] to-[var(--secondaryColor)]">
          <span className="relative flex size-10 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-110">
            <ArrowRight size={20} />
          </span>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-center">
        <h3 className="font-medium leading-snug text-gray-800 transition-colors duration-300 group-hover:primaryTextColor">
          Shop All
        </h3>
        <span className="text-xs font-medium text-gray-500 transition-colors duration-300 group-hover:text-[var(--primaryColor)]">
          Browse all categories
        </span>
      </div>
    </Link>
  );

  const skeletonCard = (i) => (
    <div
      key={i}
      className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <Skeleton height={110} />
      <div className="space-y-2 p-3">
        <Skeleton height={12} width="80%" />
        <Skeleton height={10} width="40%" />
      </div>
    </div>
  );

  return (
    <section className="bg-gray-50 py-8 md:py-12">
      <div className="xl:container xl:mx-auto px-4">
        {/* Heading */}
        <div className="mb-6 md:mb-7">
          <h2 className="text-[24px] md:text-[32px] primaryTextGradient leading-tight tracking-tight">
            Shop by Category
          </h2>
          <div className="mt-3 h-1 w-12 rounded-full bg-[var(--tertiaryColor)]" />
        </div>

        {/* MOBILE — grid with Show More / Show Less */}
        <div className="md:hidden">
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => skeletonCard(i))}
            </div>
          ) : (
            <>
              <motion.div
                layout
                className="grid grid-cols-3 gap-3"
                transition={{ layout: { duration: 0.35, ease: 'easeOut' } }}
              >
                <AnimatePresence mode="popLayout">
                  {visibleItems.map((item, i) => (
                    <motion.div
                      key={`${item._id || i}`}
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="min-w-0"
                    >
                      {renderItem(item, i)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowMore((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--primaryColor)]/25 bg-white px-6 py-2.5 text-sm font-semibold text-[var(--primaryColor)] shadow-sm transition-all duration-200 hover:primaryBgColor hover:text-white active:scale-95"
                  >
                    {showMore ? (
                      <>
                        <Minus size={16} /> Show Less
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Show More
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* DESKTOP — single line row with arrows over the row edges */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll categories left"
            className={`${arrowBtn} -left-4 lg:-left-5`}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label="Scroll categories right"
            className={`${arrowBtn} -right-4 lg:-right-5`}
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex flex-nowrap gap-4 overflow-x-auto scroll-smooth px-12 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:snap-x md:snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-[158px] shrink-0">
                    {skeletonCard(i)}
                  </div>
                ))
              : [
                  ...allItems.map((item, i) => (
                    <div
                      key={`${item._id || i}`}
                      className="w-[158px] shrink-0 snap-start"
                    >
                      {renderItem(item, i)}
                    </div>
                  )),
                  <div key="shop-all" className="w-[158px] shrink-0 snap-start">
                    {shopAllCard}
                  </div>,
                ]}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
