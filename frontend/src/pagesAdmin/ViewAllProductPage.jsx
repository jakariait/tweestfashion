import React, { useEffect } from 'react';
import ViewAllProducts from '../component/componentAdmin/ViewAllProducts.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const ViewAllProductPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('PRODUCTS', 'View All Products');
  }, []);

  return (
    <RequirePermission permission="view_products">
      <ViewAllProducts />
    </RequirePermission>
  );
};

export default ViewAllProductPage;
