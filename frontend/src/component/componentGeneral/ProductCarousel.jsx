import { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import CarouselStore from '../../store/CarouselStore.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ImageComponent from './ImageComponent.jsx';

const ProductCarousel = () => {
  const {
    CarouselStoreList,
    CarouselStoreListLoading,
    CarouselStoreListError,
  } = CarouselStore();

  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(CarouselStoreList) && CarouselStoreList.length > 0) {
      setProducts(CarouselStoreList);
    }
  }, [CarouselStoreList]);

  const settings = {
    dots: false, // Disable dots
    infinite: products.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: products.length > 1,
    autoplaySpeed: 6000,
    pauseOnHover: false,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  useEffect(() => {
    if (sliderRef.current && products.length > 1) {
      sliderRef.current.slickPlay();
    }
  }, [products]);

  if (CarouselStoreListError) {
    return (
      <div className="primaryTextColor  container md:mx-auto text-center p-3">
        <h1 className={'p-44'}>
          Something went wrong! Please try again later.
        </h1>
      </div>
    ); // Display error message
  }
  return (
    <div className="product-carousel xl:container xl:mx-auto pb-4 relative">
      {CarouselStoreListLoading ? (
        <>
          <Skeleton height={400} width={'100%'} />
        </>
      ) : (
        <>
          <Slider ref={sliderRef} {...settings}>
            {products.map((product, index) => {
              const isInternalLink = product.link?.startsWith('/');

              return (
                <div key={index} className="relative">
                  <BannerSlide
                    imgSrc={product.imgSrc}
                    link={product.link}
                    isInternalLink={isInternalLink}
                    alt={`Banner ${index + 1}`}
                    priority={index === 0}
                  />
                </div>
              );
            })}
          </Slider>
        </>
      )}
    </div>
  );
};

// Custom Arrow Components
const BannerSlide = ({ imgSrc, link, isInternalLink, alt, priority }) => {
  const image = (
    <ImageComponent
      imageName={imgSrc}
      className="w-full h-full object-contain"
      skeletonHeight={400}
      altName={alt}
      fetchpriority={priority ? 'high' : undefined}
    />
  );

  if (!link) return image;

  // Internal path -> SPA navigation; external URL -> same tab by default
  if (isInternalLink) {
    return (
      <Link to={link} className="block">
        {image}
      </Link>
    );
  }
  return (
    <a href={link} className="block">
      {image}
    </a>
  );
};

const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black text-white p-2 rounded-full z-10"
    aria-label="Previous slide"
  >
    <ChevronLeft size={30} />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black text-white p-2 rounded-full z-10"
    aria-label="Next slide"
  >
    <ChevronRight size={30} />
  </button>
);

export default ProductCarousel;
