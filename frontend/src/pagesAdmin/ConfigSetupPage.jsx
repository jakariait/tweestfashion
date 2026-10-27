import React, { useEffect } from 'react';
import ConfigSetup from '../component/componentAdmin/ConfigSetup.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const ConfigSetupPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('CONFIG', 'Setup Config');
  }, []);

  return (
    <RequirePermission permission="setup_config">
      <ConfigSetup />
    </RequirePermission>
  );
};

export default ConfigSetupPage;
