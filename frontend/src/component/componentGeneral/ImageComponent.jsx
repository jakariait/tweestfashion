import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';

const ImageComponent = ({
  imageName,
  className = '',
  altName,
  skeletonHeight,
  width,
  height,
  fetchpriority,
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    if (imageName) {
      if (imageName.startsWith('blob:') || imageName.startsWith('data:')) {
        setImageSrc(imageName);
      } else {
        const apiUrl = import.meta.env.VITE_API_URL;
        const imageUrl = `${apiUrl.replace('/api', '')}/uploads/${imageName}`;
        setImageSrc(imageUrl);
      }
    } else {
      setImageSrc('');
      setIsLoading(false);
      setHasError(true);
    }
  }, [imageName]);

  return (
    <div
      className="relative h-full"
      style={{ minHeight: isLoading ? skeletonHeight || 100 : undefined }}
    >
      {isLoading && <Skeleton height="100%" width="100%" />}
      {hasError && !isLoading && (
        <div
          className={`flex items-center justify-center bg-gray-100 text-gray-400 text-sm ${className}`}
          style={{ width: '100%', height: skeletonHeight || 100 }}
        >
          Image not found
        </div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={altName}
          className={className}
          width={width}
          height={height}
          loading={fetchpriority === 'high' ? 'eager' : 'lazy'}
          fetchpriority={fetchpriority}
          style={{
            opacity: isLoading ? 0 : 1,
            position: 'relative',
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
            setImageSrc('');
          }}
        />
      )}
    </div>
  );
};

export default ImageComponent;
