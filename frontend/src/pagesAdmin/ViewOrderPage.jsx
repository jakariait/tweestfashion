import React, { useEffect } from 'react';
import ViewOrder from '../component/componentAdmin/ViewOrder.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const AddNewCategoryPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('CATEGORY', 'View All Categories');
  }, []);

  return <ViewOrder />;
};

export default AddNewCategoryPage;
