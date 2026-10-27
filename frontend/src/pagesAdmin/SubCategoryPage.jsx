import React, { useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import SubCategoryAllinone from '../component/componentAdmin/SubCategoryAllinone.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const SubCategoryPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('SUB CATEGORY', 'View And Edit All Sub Categories');
  }, []);

  return (
    <RequirePermission permission="sub_category">
      <SubCategoryAllinone />
    </RequirePermission>
  );
};

export default SubCategoryPage;
