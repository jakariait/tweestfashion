import React, { useState, useEffect, useRef } from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import ImageComponent from './ImageComponent.jsx';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { BsArrowsFullscreen } from 'react-icons/bs';

const ProductGallery = ({
  images,
  discount,
  zoom = true,
  productName,
  focusImageName,
}) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailRefs = useRef([]);
  const lightGalleryRef = useRef(null);

  useEffect(() => {
    if (images?.length > 0) {
      const apiUrl = import.meta.env.VITE_API_URL;
      const urls = images.map(
        (imageName) => `${apiUrl.replace('/api', '')}/uploads/${imageName}`,
      );
      setImageUrls(urls);
      // New image list (e.g. new product) — start from the first image
      setActiveIndex(0);
    }
  }, [images]);

  // When a variant is selected, move the gallery to that variant's image
  useEffect(() => {
    if (!focusImageName) return;
    const idx = images.findIndex((name) => name === focusImageName);
    if (idx >= 0) setActiveIndex(idx);
  }, [focusImageName, images]);

  useEffect(() => {
    if (thumbnailRefs.current[activeIndex]) {
      thumbnailRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  const changeImage = (direction) => {
    setActiveIndex((prevIndex) => {
      if (direction === 'next') {
        return prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1;
      }
    });
  };

  const plugins = zoom ? [lgThumbnail, lgZoom] : [];

  if (imageUrls.length === 0) return <p>Loading images...</p>;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full p-1 md:p-3">
        {discount > 0 && (
          <span className="absolute md:top-3 md:left-3 bg-red-400 px-3 py-1 text-white">
            -{discount}%
          </span>
        )}

        <div className="absolute bottom-1 right-1 md:bottom-4 md:right-4 z-10 gap-1 flex justify-center items-center">
          {imageUrls.length > 1 && (
            <div className="flex items-center gap-1">
              <div className="bg-white p-2 text-xs">
                {activeIndex + 1} / {imageUrls.length}
              </div>
              <button
                className="bg-white p-2 cursor-pointer"
                onClick={() => changeImage('prev')}
                disabled={activeIndex === 0}
                aria-label="previous"
              >
                <IoIosArrowBack />
              </button>
              <button
                className="bg-white p-2 cursor-pointer"
                onClick={() => changeImage('next')}
                disabled={activeIndex === imageUrls.length - 1}
                aria-label="next"
              >
                <IoIosArrowForward />
              </button>
            </div>
          )}
        </div>

        {zoom ? (
          <LightGallery speed={500} plugins={plugins}>
            {imageUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                className={activeIndex === index ? 'block' : 'hidden'}
              >
                <ImageComponent
                  imageName={images[index]}
                  altName={productName}
                  className="w-full aspect-square object-cover"
                  skeletonHeight={'400px'}
                />
                <button
                  className="absolute md:bottom-4 bottom-1 left-1 p-3 md:left-3 bg-white rounded-full cursor-pointer"
                  aria-label={'full screen'}
                >
                  <BsArrowsFullscreen />
                </button>
              </a>
            ))}
          </LightGallery>
        ) : (
          <div>
            <ImageComponent
              imageName={images[activeIndex]}
              altName={productName}
              className="w-full aspect-square object-cover"
              skeletonHeight={'200px'}
            />
          </div>
        )}
      </div>

      {imageUrls.length > 1 && (
        <div className="flex items-center gap-2 w-full justify-center">
          <button
            onClick={() => changeImage('prev')}
            className="text-xl hover:text-gray-500 transition-colors duration-150 cursor-pointer"
            disabled={activeIndex === 0}
            aria-label="previous"
          >
            <IoIosArrowBack />
          </button>

          <div className="p-1 md:p-2 flex items-center justify-center-safe gap-1 overflow-x-auto w-full scrollbar-hide">
            <div className="flex gap-1 md:gap-4">
              {imageUrls.map((imgUrl, index) => (
                <div
                  key={index}
                  ref={(el) => (thumbnailRefs.current[index] = el)}
                  className={`cursor-pointer overflow-hidden transition-all duration-200 border-1 shrink-0 w-10 h-10 md:w-30 md:h-30 ${
                    activeIndex === index
                      ? 'primaryBorderColor scale-105'
                      : 'border-transparent opacity-80'
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <ImageComponent
                    imageName={images[index]}
                    altName={productName}
                    className="w-full aspect-square object-cover"
                    skeletonHeight={'200px'}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => changeImage('next')}
            className="text-xl hover:text-gray-500 transition-colors duration-150 cursor-pointer"
            disabled={activeIndex === imageUrls.length - 1}
            aria-label="next"
          >
            <IoIosArrowForward />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
