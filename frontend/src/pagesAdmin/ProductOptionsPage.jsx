import React, { useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import ProductOptionsAllinone from '../component/componentAdmin/ProductOptionsAllinone.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const ProductOptionsPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('PRODUCT OPTIONS', 'View all Product Options');
  }, []);

  return (
    <RequirePermission permission="product_size">
      <ProductOptionsAllinone />
    </RequirePermission>
  );
};

export default ProductOptionsPage;
