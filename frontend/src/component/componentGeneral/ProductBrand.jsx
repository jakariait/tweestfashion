import React from 'react';
import ImageComponent from './ImageComponent.jsx';
import { Link } from 'react-router-dom';

const ProductBrand = ({ product }) => {
  return (
    <div>
      {product?.brand && (
        <div className="flex items-center gap-3 ">
          {/* Brand Logo */}
          {product.brand.logo && (
            <ImageComponent
              imageName={product.brand.logo}
              className="w-10 h-10 object-contain rounded-md"
              altName={product.brand.name}
            />
          )}

          {/* Brand Name */}
          <Link
            to={`/shop?page=1&limit=20&brand=${product.brand.name}`}
            key={product.brand._id}
          >
            <h2 className="text-lg  text-gray-800">{product.brand.name}</h2>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductBrand;
