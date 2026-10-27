import React, { useEffect } from 'react';
import MarqueeAdmin from '../component/componentAdmin/MarqueeAdmin.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const GeneralInfoPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('WEBSITE CONFIG', 'Scroll Text');
  }, []);

  return (
    <div>
      {/* Form Section */}
      <RequirePermission permission="scroll_text">
        <MarqueeAdmin />
      </RequirePermission>
    </div>
  );
};

export default GeneralInfoPage;
