import React, { useEffect } from 'react';
import CarouselUpload from '../component/componentAdmin/CarouselUpload.jsx';
import FeatureImageAdmin from '../component/componentAdmin/FeatureImageAdmin.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const SliderBannerPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('WEBSITE CONFIG', 'View All Sliders and Banners');
  }, []);

  return (
    <RequirePermission permission="sliders-banners">
      <CarouselUpload />
      <FeatureImageAdmin />
    </RequirePermission>
  );
};

export default SliderBannerPage;
