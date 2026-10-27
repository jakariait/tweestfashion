import React, { useEffect } from 'react';
import GeneralInfoForm from '../component/componentAdmin/GeneralInfoForm.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const GeneralInfoPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('WEBSITE CONFIG', 'General Info');
  }, []);

  return (
    <div>
      {/* Form Section */}
      <RequirePermission permission="general_info">
        <GeneralInfoForm />
      </RequirePermission>
    </div>
  );
};

export default GeneralInfoPage;
