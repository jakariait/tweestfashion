import React, { useEffect } from 'react';
import SocialMediaLinks from '../component/componentAdmin/SocialMediaLinks.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const SocialLinkUpdaterPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('WEBSITE CONFIG', 'Social Media Links');
  }, []);

  return (
    <RequirePermission permission="website_theme_color">
      <SocialMediaLinks />
    </RequirePermission>
  );
};

export default SocialLinkUpdaterPage;
