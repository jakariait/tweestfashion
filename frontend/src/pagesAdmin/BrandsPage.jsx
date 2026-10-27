import React, { useEffect } from 'react';
import useBreadcrumbStore from '@/store/BreadcrumbStore.js';
import RequirePermission from '@/component/componentAdmin/RequirePermission.jsx';
import BrandsAllInOne from '@/component/componentAdmin/BrandsAllInOne.jsx';

const BrandsPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('BRANDS', 'View All Brands');
  }, []);

  return (
    <RequirePermission permission="brands">
      <div className="flex min-h-0 flex-1 flex-col">
        <BrandsAllInOne />
      </div>
    </RequirePermission>
  );
};

export default BrandsPage;
