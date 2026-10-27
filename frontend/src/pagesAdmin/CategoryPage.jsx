import React, { useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import AdminCategoryAllinone from '../component/componentAdmin/AdminCategoryAllinone.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const CategoryPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('CATEGORY', 'View And Edit All Categories');
  }, []);

  return (
    <RequirePermission permission="category">
      <AdminCategoryAllinone />
    </RequirePermission>
  );
};

export default CategoryPage;
