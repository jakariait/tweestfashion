import React, { useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import ProductForm from '../component/componentAdmin/ProductForm.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const EditProductPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('PRODUCT', 'Edit Product');
  }, []);

  return (
    <RequirePermission permission="edit_products">
      <ProductForm isEdit={true} />
    </RequirePermission>
  );
};

export default EditProductPage;
