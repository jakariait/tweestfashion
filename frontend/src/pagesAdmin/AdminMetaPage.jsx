import React, { useEffect } from 'react';
import AdminMetaForm from '../component/componentAdmin/AdminMetaForm.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const GeneralInfoPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('WEBSITE CONFIG', 'SEO for HomePage');
  }, []);

  return (
    <div>
      {/* Form Section */}
      <RequirePermission permission="home_page_seo">
        <AdminMetaForm />
      </RequirePermission>
    </div>
  );
};

export default GeneralInfoPage;
