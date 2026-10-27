import React, { useEffect } from 'react';
import ColorUpdater from '../component/componentAdmin/ColorUpdater.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const ColorUpdaterPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('WEBSITE CONFIG', 'Website Theme Color');
  }, []);

  return (
    <RequirePermission permission="website_theme_color">
      <ColorUpdater />
    </RequirePermission>
  );
};

export default ColorUpdaterPage;
