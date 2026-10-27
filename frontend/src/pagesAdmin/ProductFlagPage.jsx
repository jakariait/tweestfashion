import React, { useEffect } from 'react';
import FlagsComponent from '../component/componentAdmin/FlagsComponent.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const ProductFlagPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('PRODUCT FLAG', 'View All Product Flags');
  }, []);

  return (
    <RequirePermission permission="product_flag">
      <FlagsComponent />
    </RequirePermission>
  );
};

export default ProductFlagPage;
