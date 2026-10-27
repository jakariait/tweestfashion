import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useProductStore from '../../store/useProductStore.js';
import useFlagStore from '../../store/useFlagStore.js';
import ProductList from './ProductList.jsx';
import Skeleton from 'react-loading-skeleton';
import { FaArrowRight } from 'react-icons/fa';

const ProductByFlag = () => {
  const { homeProducts, loading } = useProductStore();
  const { flags, fetchFlags, loading: flagsLoading } = useFlagStore();

  useEffect(() => {
    if (!flags || flags.length === 0) {
      fetchFlags();
    }
  }, [fetchFlags, flags]);

  const hasFlags = flags && flags.length > 0;
  const hasProducts = Object.keys(homeProducts).length > 0;

  if (loading || flagsLoading || !hasFlags || !hasProducts)
    return (
      <div className="xl:container xl:mx-auto p-4">
        <div className="flex items-center gap-4 my-6">
          <div className="grow h-px bg-gray-300"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="grow h-px bg-gray-300"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="relative">
              <Skeleton height={250} className="!rounded-lg" />
              <div className="mt-2 mb-1">
                <Skeleton height={14} width="80%" />
              </div>
              <div className="flex gap-2">
                <Skeleton height={14} width={50} />
                <Skeleton height={14} width={50} />
              </div>
              <div className="pt-3">
                <Skeleton height={36} className="!rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="xl:container xl:mx-auto p-4 justify-center md:justify-start">
      {flags.map((flag) => {
        const products = homeProducts[flag.name] || [];
        if (products.length === 0) return null; // Skip if no products for this flag

        const encodedFlag = encodeURIComponent(flag.name); // for URL safety
        const viewAllLink = `/shop?page=1&limit=20&flags=${encodedFlag}`;

        const slicedProducts = products.slice(0, 8); // Show max 8

        return (
          <div key={flag._id} className={'mb-5'}>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-grow h-px bg-gray-400"></div>
              <h2 className="text-lg pl-10 pr-10 font-bold secondaryTextColor whitespace-nowrap uppercase tracking-widest">
                {flag.name}
              </h2>
              <div className="flex-grow h-px bg-gray-400"></div>
            </div>

            {/* ✅ Render once with sliced products */}
            <ProductList products={slicedProducts} />
            <div className={'flex flex-wrap justify-center mt-5'}>
              {products.length > 8 && (
                <Link
                  to={viewAllLink}
                  className="primaryTextColor primaryBorderColor border-1 px-4 py-2 rounded"
                >
                  <div className="flex gap-6 justify-center items-center">
                    View All <FaArrowRight />
                  </div>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductByFlag;
