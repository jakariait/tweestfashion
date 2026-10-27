import React, { useEffect } from 'react';
import AbandonedCartsContainer from '../component/componentAdmin/AbandonedCartsContainer.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const AbandonedCartPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('INCOMPLETE ORDER', 'View All Incomplete Orders');
  }, []);

  return (
    <RequirePermission permission="incomplete_orders">
      <AbandonedCartsContainer />
    </RequirePermission>
  );
};

export default AbandonedCartPage;
