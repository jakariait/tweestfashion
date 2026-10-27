import React, { useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import ChildCategoryAllinone from '../component/componentAdmin/ChildCategoryAllinone.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const ChildCategoryPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('CHILD CATEGORY', 'View And Edit All Child Categories');
  }, []);

  return (
    <RequirePermission permission="child_category">
      <ChildCategoryAllinone />
    </RequirePermission>
  );
};

export default ChildCategoryPage;
