import React, { useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import ProductForm from '../component/componentAdmin/ProductForm.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const AddNewProductPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('PRODUCT', 'Add New Product');
  }, []);

  return (
    <RequirePermission permission="add_products">
      <ProductForm isEdit={false} />
    </RequirePermission>
  );
};

export default AddNewProductPage;
