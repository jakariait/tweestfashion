import React, { useEffect } from 'react';
import AdminFAQSection from '../component/componentAdmin/AdminFAQSection.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const AddNewCategoryPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('ABOUT US', 'Update About Us');
  }, []);

  return (
    <RequirePermission permission="faqs">
      <AdminFAQSection />
    </RequirePermission>
  );
};

export default AddNewCategoryPage;
