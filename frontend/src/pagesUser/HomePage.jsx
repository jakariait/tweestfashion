import { useEffect } from 'react';
import CarouselStore from '../store/CarouselStore.js';
import FeatureStore from '../store/FeatureStore.js';
import useProductStore from '../store/useProductStore.js';
import ProductCarousel from '../component/componentGeneral/ProductCarousel.jsx';
import Feature from '../component/componentGeneral/Feature.jsx';
import ProductByFlag from '../component/componentGeneral/ProductByFlag.jsx';
import CustomerFeedback from '@/component/componentGeneral/CustomerFeedback.jsx';
import Brands from '@/component/componentGeneral/Brands.jsx';
import ShopByCategory from '@/component/componentGeneral/ShopByCategory.jsx';

const HomePage = () => {
  const { CarouselStoreListRequest } = CarouselStore();
  const { FeatureStoreListRequest } = FeatureStore();
  const { fetchHomeProducts } = useProductStore();

  useEffect(() => {
    CarouselStoreListRequest();
    FeatureStoreListRequest();
    fetchHomeProducts();
  }, []);

  return (
    <>
      <h1 className="sr-only">Welcome to Our Store</h1>
      <ProductCarousel />
      <ShopByCategory />
      <Feature />
      <ProductByFlag />
      <CustomerFeedback />
      <Brands topBrandsOnly={true} />
    </>
  );
};

export default HomePage;
