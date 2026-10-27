import React, { useEffect } from 'react';
import PageEditor from '../component/componentAdmin/PageEditor.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const AddNewCategoryPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('ABOUT US', 'Update About Us');
  }, []);

  return (
    <RequirePermission permission="about_terms-policies">
      <PageEditor title="About Us" endpoint="about" />
    </RequirePermission>
  );
};

export default AddNewCategoryPage;
