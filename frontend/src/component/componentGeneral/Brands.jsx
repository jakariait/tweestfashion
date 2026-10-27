import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import ImageComponent from './ImageComponent.jsx';

const apiUrl = import.meta.env.VITE_API_URL;

const Brands = ({ topBrandsOnly = false, showEmptyState = false }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const displayBrands = topBrandsOnly
    ? brands.filter((b) => b.isTopBrand)
    : brands;

  const filteredBrands = (displayBrands || []).filter(
    (brand) =>
      brand && brand.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/brands`);
        if (response.data.success && response.data.data) {
          setBrands(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (!loading && !showEmptyState && brands.length === 0) return null;
  if (
    !loading &&
    !showEmptyState &&
    topBrandsOnly &&
    displayBrands.length === 0
  )
    return null;

  return (
    <section
      className={`flex flex-1 flex-col ${topBrandsOnly ? 'py-4 ' : 'bg-gray-50 py-10'}`}
    >
      <div className="xl:container xl:mx-auto px-4">
        <div
          className={`text-center mb-6 border-b border-gray-200 pb-4 ${topBrandsOnly ? 'flex items-center justify-between border-b-0 pb-0 mb-4' : ''}`}
        >
          <div>
            <h2
              className={`font-semibold text-gray-800 leading-tight tracking-tight ${topBrandsOnly ? 'text-xl' : 'text-[28px] md:text-[34px]'}`}
            >
              {topBrandsOnly ? 'Top Brands' : 'Our Brands'}
            </h2>
            {!topBrandsOnly && (
              <p className="text-sm text-gray-500 mt-1">
                Shop from top brands.
              </p>
            )}
          </div>
          {topBrandsOnly && (
            <Link
              to="/brands"
              className="text-sm font-medium text-[var(--primaryColor)] hover:underline whitespace-nowrap"
            >
              All Brands &rarr;
            </Link>
          )}
        </div>

        {!topBrandsOnly && (
          <div className="mb-6">
            <label htmlFor="brand-search" className="sr-only">
              Search brands
            </label>
            <input
              id="brand-search"
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md mx-auto block px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primaryColor)] focus:border-transparent"
            />
          </div>
        )}

        {loading ? (
          <div
            className={`flex ${topBrandsOnly ? 'overflow-x-auto gap-3 pb-2 scrollbar-hide' : 'flex-wrap justify-center gap-4'}`}
          >
            {Array.from({ length: topBrandsOnly ? 4 : 6 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-md overflow-hidden bg-white border border-gray-200 shrink-0 ${topBrandsOnly ? 'w-[120px]' : 'w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(16.666%-0.833rem)] xl:w-[calc(12.5%-0.875rem)]'}`}
              >
                <Skeleton height={topBrandsOnly ? 80 : 160} />
                <div className="p-3">
                  <Skeleton height={16} width="70%" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`flex ${topBrandsOnly ? 'overflow-x-auto gap-3 pb-2 scrollbar-hide' : 'flex-wrap justify-center gap-4'}`}
          >
            {filteredBrands.length === 0 ? (
              <p className="text-gray-500 text-sm">No brands found.</p>
            ) : (
              filteredBrands.map((brand) => (
                <Link
                  key={brand._id}
                  to={`/shop?page=1&limit=20&brand=${brand.name}`}
                  className={`group relative bg-white rounded-md border border-gray-200 overflow-hidden transition-colors duration-200 hover:border-[var(--primaryColor)]/40 shrink-0 ${topBrandsOnly ? 'w-[100px] md:w-[120px]' : 'w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(16.666%-0.833rem)] xl:w-[calc(12.5%-0.875rem)]'}`}
                >
                  {!topBrandsOnly && (
                    <>
                      <span className="pointer-events-none absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[var(--primaryColor)] opacity-0 -translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 z-10" />
                      <span className="pointer-events-none absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[var(--primaryColor)] opacity-0 translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 z-10" />
                      <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[var(--primaryColor)] opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 z-10" />
                      <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[var(--primaryColor)] opacity-0 translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 z-10" />
                    </>
                  )}

                  <div
                    className={`overflow-hidden ${topBrandsOnly ? '' : 'aspect-square'}`}
                  >
                    <ImageComponent
                      imageName={brand.logo}
                      className={`w-full h-full object-contain ${topBrandsOnly ? '' : 'p-5'} grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-300`}
                      altName={topBrandsOnly ? brand.name : ''}
                      skeletonHeight={topBrandsOnly ? 80 : 160}
                    />
                  </div>

                  {!topBrandsOnly && (
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800 text-sm truncate text-center group-hover:primaryTextColor transition-colors">
                        {brand.name}
                      </h3>
                    </div>
                  )}
                </Link>
              ))
            )}
            {topBrandsOnly && filteredBrands.length > 0 && (
              <Link
                to="/shop"
                className="shrink-0 w-[100px] md:w-[120px] flex items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 hover:text-[var(--primaryColor)] hover:border-[var(--primaryColor)] transition-colors"
              >
                View All
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Brands;
